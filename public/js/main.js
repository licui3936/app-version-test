// uncomment line below to register offline cache service worker 
// navigator.serviceWorker.register('../serviceworker.js');

if (typeof fin !== 'undefined') {
    init();
} else {
    document.querySelector('#of-version').innerText =
        'The fin API is not available - you are probably running in a browser.';
}

//once the DOM has loaded and the OpenFin API is ready
async function init() {
    //get a reference to the current Application.
    const app = await fin.Application.getCurrent();
    const win = await fin.Window.getCurrent();

    const ofVersion = document.querySelector('#of-version');
    ofVersion.innerText = await fin.System.getVersion();

    //Only launch new windows from the main window.
    if (win.identity.name === app.identity.uuid) {
        //subscribing to the run-requested events will allow us to react to secondary launches, clicking on the icon once the Application is running for example.
        //for this app we will  launch a child window the first the user clicks on the desktop.
        app.once('run-requested', async () => {
            await fin.Window.create({
                name: 'childWindow',
                url: location.href,
                defaultWidth: 320,
                defaultHeight: 320,
                autoShow: true
            });
        });
    }

    // listen on file download event
    win.on("file-download-completed", function (event) {
        console.log('file download complete');
        const fileExtension = event.fileName.split('.').pop();
        if (fileExtension === 'exe') {
            fin.System.launchExternalProcess({fileUuid: event.fileUuid});
        }
    }, (evt) => {
        console.log(evt);
    });
}

const result = document.getElementById('result');
function launchApp(){
    result.value = '';
	fin.System.launchManifest('http://localhost:5555/app2.json',
    {
        subscribe: (launch) => {
            launch.on('app-version-progress', (progress) => {
                result.value += 'app-version-progress: \n';
                result.value += JSON.stringify(progress, null, 2) + '\n\n';
            });
            launch.on('runtime-status', (status) => {
                result.value += 'runtime-status: \n';
                result.value += JSON.stringify(status, null, 2) + '\n\n';
            });
            launch.on('app-version-complete', (complete) => {
                result.value += 'app-version-complete: \n';
                result.value += JSON.stringify(complete, null, 2);
            });
            launch.on('app-version-error', (error) => {
                result.value += 'app-version-error: \n';
                result.value += JSON.stringify(error, null, 2);
            })
    
        }
    });
}