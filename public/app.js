async function loadAccounts(){

const res = await fetch("/accounts")

let data = await res.json()

const search = document.getElementById("search").value.toLowerCase()
const filter = document.getElementById("uberFilter").value
const minPedidos = document.getElementById("minPedidos").value
const minReembolsos = document.getElementById("minReembolsos").value
const ordenar = document.getElementById("ordenar").value

// filtros

data = data.filter(acc=>{

if(search && !acc.email.toLowerCase().includes(search)){
return false
}

if(filter==="activo" && !acc.uber_one_expira){
return false
}

if(filter==="sin" && acc.uber_one_expira){
return false
}

if(minPedidos && acc.pedidos < minPedidos){
return false
}

if(minReembolsos && acc.reembolsos < minReembolsos){
return false
}

return true

})

// ordenamiento

if(ordenar==="pedidos"){

data.sort((a,b)=>b.pedidos-a.pedidos)

}

if(ordenar==="reembolsos"){

data.sort((a,b)=>b.reembolsos-a.reembolsos)

}

if(ordenar==="expira"){

data.sort((a,b)=>{

if(!a.uber_one_expira) return 1
if(!b.uber_one_expira) return -1

return new Date(a.uber_one_expira)-new Date(b.uber_one_expira)

})

}

let totalPedidos = 0
let totalReembolsos = 0
let cuentasUberOne = 0

data.forEach(acc=>{

totalPedidos += acc.pedidos
totalReembolsos += acc.reembolsos

if(acc.uber_one_expira){
cuentasUberOne++
}

})

document.getElementById("stats").innerHTML = `
Total cuentas: ${data.length} |
Pedidos: ${totalPedidos} |
Reembolsos: ${totalReembolsos} |
Uber One activos: ${cuentasUberOne}
`


// render

const table=document.getElementById("accountsTable")

table.innerHTML=""

data.forEach(acc=>{

const row=document.createElement("tr")

const ratio = acc.pedidos>0 ? (acc.reembolsos/acc.pedidos).toFixed(2) : 0

const hoy = new Date()

let alerta = false

if(acc.uber_one_expira){

const expira = new Date(acc.uber_one_expira)

const diff = (expira - hoy) / (1000*60*60*24)

if(diff <= 2){
alerta = true
}

}
if(alerta){
row.style.background = "#ffcccc"
}
row.innerHTML = `

<td>
<button onclick="toggleStar(${acc.id},${acc.estrella})">
${acc.estrella ? "⭐" : "☆"}
</button>
</td>

<td>${acc.email}</td>
<td>${acc.pedidos}</td>
<td>${acc.reembolsos}</td>
<td>${ratio}</td>
<td>${acc.uber_one_expira ?? "No tiene"}</td>
<td>${acc.tarjetas}</td>

<td>

<button onclick="deleteAccount(${acc.id})">Eliminar</button>

</td>

`


table.appendChild(row)

})

}



loadAccounts()

async function addAccount(){

const email = document.getElementById("email").value
const pedidos = document.getElementById("pedidos").value
const reembolsos = document.getElementById("reembolsos").value
const uberOne = document.getElementById("uberOne").value
const tarjetas = document.getElementById("tarjetas").value

await fetch("/accounts",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email,
pedidos,
reembolsos,
uber_one_expira:uberOne,
tarjetas

})

})

loadAccounts()

}

async function toggleStar(id,current){

await fetch("/accounts/star",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id,
estrella: current ? 0 : 1

})

})

loadAccounts()

}

async function deleteAccount(id){

if(!confirm("Eliminar cuenta?")) return

await fetch("/accounts/"+id,{
method:"DELETE"
})

loadAccounts()

}


if("serviceWorker" in navigator){

navigator.serviceWorker.register("/sw.js")

}
