const { count } = require('console');
var fs = require('fs');
const nodeCron = require("node-cron");
const path = require("path");
const fetch = require('node-fetch');
var proxyip = "127.0.0.1"
var proxyport = "8881"
const job = nodeCron.schedule("* 30 * * * *", function jobYouNeedToExecute() {
 
//grab vpngate data
url = "https://www.vpngate.net/api/iphone/";
fetch(url).then(res => res.text())
.then(string => {
    d = string.replace("*vpn_servers", "").replace("#HostName,IP,Score,Ping,Speed,CountryLong,CountryShort,NumVpnSessions,Uptime,TotalUsers,TotalTraffic,LogType,Operator,Message,OpenVPN_ConfigData_Base64", "").replace(/\r?\n?/g, '');
            datastring = d.split(",");
var UDPNameArray = new Array();
var TCPIPArray = new Array();
var TCPPortArray=  new Array();
var TCPNameArray = new Array();
var IPnPortArray = new Array();
cnumcount = 0;
udpnumcount = 0;
directcnumcount = 0;
//number tools 
cnum = 0;
directcnum = 0;
ovpnnum = 0;
ipnum = 0;

for(var i =0; i < datastring.length; i++){
    cnum++
    ipnum++
    ovpnnum++
    if(ovpnnum == 15){
    ovpnnum = ovpnnum - 14;
    data = datastring[i].split("\n")[0];
    //convert the base64 to a ovpn profile
let buff = new Buffer.from(data, 'base64');
let text = buff.toString('ascii');
//remove all comments (#)
var uncommented = text.replace(/^#.*\n?/gm, '');
//remove all new lines
ovpn = uncommented.split(/\r?\n/).filter(line => line.trim() !== '').join('\n');

//UDP
if(ovpn.includes("proto udp")){
  udpnumcount++
  UDPNameArray.push(`${udpnumcount}-${d.split(ovpn.split("remote ")[1].split(" ")[0])[1].toString().split(",")[4]}`)
fs.writeFileSync(`${__dirname}/OVPN/UDP/${[udpnumcount]}.ovpn`, ovpn.split("</key>")[0]+`</key>`, (err) => {
  if (err)
  console.log(err);
})

}

//Direct TCP
if(ovpn.includes("proto tcp")){
directcnumcount++
fs.writeFileSync(`${__dirname}/OVPN/DirectTCP/${[directcnumcount]}.ovpn`, ovpn.split("</key>")[0]+`</key>`, (err) => {
  if (err)
  console.log(err);
})
}

//add proxy server data
proxiedovpn = ovpn.replace(";http-proxy [proxy server] [proxy port]", `http-proxy ${proxyip} ${proxyport}`)

//Phantom TCP only
if(proxiedovpn.includes("proto tcp")){
    cnumcount++
    cnum = cnum - 14;
    //vpnprofile
    oneline = proxiedovpn
    TCPIPArray.push(proxiedovpn.split("remote ")[1].split(" ")[0])
    TCPPortArray.push(proxiedovpn.split("remote ")[1].split(" ")[1].split("\n")[0])
    TCPNameArray.push(`${cnumcount}-${d.split(proxiedovpn.split("remote ")[1].split(" ")[0])[1].toString().split(",")[4]}`)
    IPnPortArray.push(`${cnumcount}-${d.split(proxiedovpn.split("remote ")[1].split(" ")[0])[1].toString().split(",")[4]}=${proxiedovpn.split("remote ")[1].split(" ")[0]}:${proxiedovpn.split("remote ")[1].split(" ")[1].split("\n")[0]}`)
    fs.writeFileSync(`${__dirname}/OVPN/TCP/${[cnumcount]}.ovpn`, proxiedovpn.split("</key>")[0]+`</key>`, (err) => {
        if (err)
        console.log(err);
  });
}
}
}
   const jsonString = fs.readFileSync("website/api/app.json");
   appdata = JSON.parse(jsonString)
   appdata.udpservers = [UDPNameArray.toString()]
   appdata.Allservers = [TCPNameArray.toString()]
   appdata.ip_port = [`${IPnPortArray.toString()}`]
  
   fs.writeFileSync("website/api/app.json", JSON.stringify(appdata, null, 2), (err) => {
    if (err) {
        console.log("Failed to write updated data to file");
        return;
    }
    console.log("Updated file successfully");
    
});
} );

});

