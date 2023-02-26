const ProfileData = document.getElementById('profile_data_area');
const AttendanceData = document.getElementById('attendance_data_area');
const userID = document.getElementById("hidden_user_id").value;


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
    if(data.status_code === 200){
        document.getElementById("loader").style.display = "none";
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