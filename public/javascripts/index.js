var socket = io();

window.onload = function() {
    
    var winstreakText = document.getElementById('winstreak');
    var winsText = document.getElementById('wins');

    socket.on('wins', (msg) => {
        console.log(msg);
        winstreakText.innerHTML = msg.streak;
        winsText.innerHTML = msg.wins;
    });
};