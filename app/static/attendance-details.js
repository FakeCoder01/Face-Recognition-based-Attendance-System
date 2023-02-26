const ProfileData = document.getElementById('profile_data_area');
const AttendanceData = document.getElementById('attendance_data_area');
const userID = document.getElementById("hidden_user_id").value;
const profile_dlt_btn = document.getElementById("profile_dlt_btn");


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

    fetch('/users/update/'+userID, {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
            .then(data => {
            
            if(data.status_code === 200){
                emailInput.value = data.user.email;
                nameInput.value = data.user.name;
                document.getElementById("IMAGE_SHOW").src = "data:image/png;base64," + data.user.image;
                document.getElementById("modalArea").innerHTML = `
                    <div>
                        <div onclick="this.style.display='none';" class="p-2 bg-green-200 text-green-800 cursor-pointer p-4 text-lg rounded border border-green-700 my-3">
                            <span class="underline font-semibold text-green-600">Success</span> User has been updated
                        </div>
                    </div>
                `; 
            }else if(data.status_code === 422){
                document.getElementById("modalArea").innerHTML = `
                        <div>
                            <div onclick="this.style.display='none';" class="p-2 bg-red-200 text-red-800 cursor-pointer p-4 text-lg rounded border border-red-700 my-3">
                            <span class="underline font-semibold text-red-700">Error</span> Data can not be proccessed
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
                alert("Something Went wrong while updting");
            }else{
                window.location.href="";
            }
            document.getElementById("loader").style.display = "none";
            form.reset();
        })
        .catch(error => {
            console.error
        });
});

profile_dlt_btn.addEventListener('click', async (event) => {
    fetch('/users/delete/'+userID, {
        method: 'POST',
    })
        .then(response => response.json())
        .then(data => {
            if(data.status_code === 200){
                alert("Success! User has been Deleted");
                window.location.href = "/";
            }else{
                console.log(data);
                alert("Can not be deleted")
            }
        })
        .catch(error => {
            console.error
        });
});

/*

fetch('/users/?id='+userID)
.then(response => response.json())
.then(data => {
    if(data.status_code === 200){
        const user = data.user;
        ProfileData.innerHTML += `
            <div class="flex items-center justify-between">
                <span class="text-emerald-400">
                    <img src="data:image/png;base64,${user.image}" alt="IMAGE">
                </span>
            </div>
            <div class="mt-6 w-fit mx-auto">
                <img src="https://api.lorem.space/image/face?w=120&h=120&hash=bart89fe" class="rounded-full w-28 " alt="profile picture" srcset="">
            </div>

            <div class="mt-8 ">
                <h2 class="text-white font-bold text-2xl tracking-wide">${user.name}</h2>
            </div>
            <p class="text-emerald-400 font-semibold mt-2.5" >
                ${user.email}
            </p>
        `;
        
    }else if(data.status_code === 500){
        alert("Something Went wrong")
    }else{
        window.location.href="";
    }    
})
.catch(error => {
    console.error
});


*/


fetch('/attendance/?id='+userID)
.then(response => response.json())
.then(data => {
    document.getElementById("loader").style.display = "none";
    if(data.status_code === 200){
        for(i=0; i<data.attendance.length; i++){
            const attendance = data.attendance[i];
            AttendanceData.innerHTML += `
                <tr>
  
                    <td class="p-2 whitespace-nowrap">
                        <div class="text-left">${attendance.date}</div>
                    </td>
                    <td class="p-2 whitespace-nowrap">
                        <div class="text-left font-medium text-green-500">${attendance.status}</div>
                    </td>
                </tr>
            `;
        }
    }else if(data.status_code === 500){
        alert("Something Went wrong")
    }else{
        window.location.href="";
    }    
})
.catch(error => {
    console.error
});


