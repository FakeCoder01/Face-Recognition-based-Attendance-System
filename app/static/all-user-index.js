const TableData = document.getElementById('table_add_new_item');

fetch('/all-users')
.then(response => response.json())
.then(data => {
    if(data.status_code === 200){
        document.getElementById("loader").style.display = "none";
        for(i=0; i<data.users.length; i++){
            const user = data.users[i];
            TableData.innerHTML += `
                <tr>
                    <td class="p-2 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-10 h-10 flex-shrink-0 mr-2 sm:mr-3">
                                <img class="rounded-full" src="data:image/png;base64,${user.image}" width="40" height="40" alt="Alex Shatov">
                            </div>
                            <div class="font-medium text-gray-800">${user.name}</div>
                        </div>
                    </td>
                    <td class="p-2 whitespace-nowrap">
                        <div class="text-left">${user.email}</div>
                    </td>
                    <td class="p-2 whitespace-nowrap">
                        <div class="text-left font-medium text-green-500">${user.id}</div>
                    </td>
                    <td class="p-2 whitespace-nowrap">
                        <div class="text-lg text-center">
                            <a target="_blank" href="/dash/${user.id}">GO>> </a>
                        </div>
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