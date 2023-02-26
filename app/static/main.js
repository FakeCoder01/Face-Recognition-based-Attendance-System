const captureBtn = document.getElementById("capture-btn");
const captureModal = document.getElementById("capture-modal");
const videoFeed = document.getElementById("video-feed");
const captureCanvas = document.getElementById("capture-canvas");
const ctx = captureCanvas.getContext("2d");

captureBtn.addEventListener("click", () => {
    var load_per = true;
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoFeed.srcObject = stream;
        captureModal.classList.remove("hidden");
        videoFeed.addEventListener("loadedmetadata", () => {
            if (load_per == false) return;
            captureCanvas.width = videoFeed.videoWidth;
            captureCanvas.height = videoFeed.videoHeight;

            const captureInterval = setInterval(() => {
                ctx.drawImage(videoFeed, 0, 0, captureCanvas.width, captureCanvas.height);
                const imageBlob = captureCanvas.toDataURL("image/png");
                clearInterval(captureInterval);
                stream.getTracks()[0].stop();

                const formData = new FormData();
                formData.append("image_data", imageBlob);
                document.getElementById("loader").style.display = "block";

                fetch("/attendance", {
                    method: "POST",
                    body: formData,
                })

                    .then((response) => response.json())
                    .then((data) => {
                        document.getElementById("loader").style.display = "none";
                        if (data.status_code === 200) {
                            document.getElementById("modalArea").innerHTML = `
                            <div class="relative z-10" aria-labelledby="modal-title shadow-4xl" role="dialog" aria-modal="true">
                                <div class="fixed inset-0 z-10 overflow-y-auto ">
                                    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                                    <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4" style="border-top: 4px solid #4ecf4e99;">
                                        <div class="sm:flex sm:items-start">
                                            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
                                             <path d="M12 2C6.49 2 2 6.49 2 12C2 17.51 6.49 22 12 22C17.51 22 22 17.51 22 12C22 6.49 17.51 2 12 2ZM16.78 9.7L11.11 15.37C10.97 15.51 10.78 15.59 10.58 15.59C10.38 15.59 10.19 15.51 10.05 15.37L7.22 12.54C6.93 12.25 6.93 11.77 7.22 11.48C7.51 11.19 7.99 11.19 8.28 11.48L10.58 13.78L15.72 8.64C16.01 8.35 16.49 8.35 16.78 8.64C17.07 8.93 17.07 9.4 16.78 9.7Z" fill="#0d914d"></path>
                                            </g></svg>
                                            </div>
                                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Attendance Marked Successfully</h3>
                                            <div class="mt-2">
                                                <p class="text-sm text-gray-500">
                                                    <span class="block font-semibold text-gray">Name : ${data.data.name}</span>
                                                    <span class="block font-semibold text-gray">Email : ${data.data.email}</span>
                                                    <span class="block font-semibold underline text-gray">For : ${data.data.date}</span>
                                                </p>
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            <button type="button" onclick="window.location.href='/dash/${data.data.id}';"
                                             class="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
                                             Check</button>
                                            <button type="button" onclick="window.location.href='/verify';"
                                                class="mt-3 inline-flex w-full justify-center rounded-md border border-green-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>`

                        } else if (data.status_code === 402) {
                            document.getElementById("modalArea").innerHTML = `
                            <div class="relative z-10" aria-labelledby="modal-title shadow-4xl" role="dialog" aria-modal="true">
                                <div class="fixed inset-0 z-10 overflow-y-auto ">
                                    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                                    <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4" style="border-top: 4px solid red;">
                                        <div class="sm:flex sm:items-start">
                                            <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                         
                                                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                                </svg>
                                            </div>
                                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Face not Matched</h3>
                                            <div class="mt-2">
                                                <p class="text-sm text-gray-500">Make sure your full face is visible and don't wear any mask</p>
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            <button type="button" onclick="window.location.href='/verify';"
                                             class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
                                             Try again</button>
                                       
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>`
                        } else if (data.status_code === 500) {
                            alert("Something Went Wrong")
                        } else {
                            window.location.href="";
                        }   
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        captureModal.classList.add("hidden");
                        videoFeed.srcObject = null;
                    });
                load_per = false;
            }, 2000);
        });
    });
});