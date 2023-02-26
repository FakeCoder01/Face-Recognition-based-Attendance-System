const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const imageInput = document.getElementById('image');

form.addEventListener('submit', async (event) => {
    document.getElementById("loader").style.display = "block";
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("email", emailInput.value);
    formData.append("image", imageInput.files[0]);

    fetch('/users/add', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("loader").style.display = "none";
            if(data.status_code === 200){
                document.getElementById("modalArea").innerHTML = `
                    <div>
                        <div onclick="this.style.display='none';" class="p-2 bg-green-200 text-green-800 cursor-pointer p-4 text-lg rounded border border-green-700 my-3">
                            <span class="underline font-semibold text-green-600">Success</span> New user has been added
                        </div>
                    </div>
                `; 
            }else if(data.status_code === 422){
                document.getElementById("modalArea").innerHTML = `
                    <div>
                        <div onclick="this.style.display='none';" class="p-2 bg-red-200 text-red-800 cursor-pointer p-4 text-lg rounded border border-red-700 my-3">
                        <span class="underline font-semibold text-red-700">Error</span> Data can not be proccsed
                        </div>
                    </div>`; 
            }else if(data.status_code === 402){
                document.getElementById("modalArea").innerHTML = `
                    <div>
                    
                        <div onclick="this.style.display='none';" class="p-2 bg-red-200 text-red-800 cursor-pointer p-4 text-lg rounded border border-red-700 my-3">
                            <span class="underline font-semibold text-red-700">Error</span> ${data.message}
                        </div>
                    </div>`; 
            }else if(data.status_code === 500){
                alert("Something Went wrong")
            }else{
                window.location.href="";
            }
            form.reset();
        })
        .catch(error => {
            console.error
        });
});