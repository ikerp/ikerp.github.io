const canvasSim = document.querySelector('#canvasSim');
const ctxSim = canvasSim.getContext('2d');

const canvasGraf = document.querySelector('#canvasGraf');
const ctxGraf = canvasGraf.getContext('2d');

const contTotal = document.querySelector('#contTotal');
const contInfectados = document.querySelector('#contInfectados');
const contCurados = document.querySelector('#contCurados');
const contMuertos = document.querySelector('#contMuertos');

const inputPoblacion = document.querySelector('#inputPoblacion');
const inputMovilidad = document.querySelector('#inputMovilidad');
const inputIncubacion = document.querySelector('#inputIncubacion');
const inputMortalidad = document.querySelector('#inputMortalidad');
const inputAislamiento = document.querySelector('#inputAislamiento');
const inputTiempoSim = document.querySelector('#inputTiempoSim');
const btnSimular = document.querySelector('#btnSimular');
const inputSemilla = document.querySelector('#inputSemilla');
const lblSemilla = document.querySelector('#lblSemilla');

let animationFrameId;
let currentSimulation;

btnSimular.onclick = function() {
    if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
    }
    currentSimulation = new Simulacion(
        inputPoblacion.value,
        inputMovilidad.value,
        inputIncubacion.value,
        inputMortalidad.value,
        inputAislamiento.value,
        inputTiempoSim.value,
        inputSemilla.value
    );
    loop();
}

const height = 600;
const width = 600;
const divisorWidth = 3;

const radio = 6;
const vel = 1;

// colores
const gris = '#888888';
const rojo = '#ff0000';
const verde = '#3CAC0B';
const negro = '#000000';
const blanco = '#ffffff';
const azul = '#0099ff'

const defaultText = document.querySelectorAll('.defaultText');
defaultText.forEach(function(v) {
    v.style.color = gris;
});

const textSanos = document.querySelectorAll('.textSanos');
textSanos.forEach(function(v) {
    v.style.color = gris;
});
const textInfectados = document.querySelectorAll('.textInfectados');
textInfectados.forEach(function(v) {
    v.style.color = rojo;
});
const textCurados = document.querySelectorAll('.textCurados');
textCurados.forEach(function(v) {
    v.style.color = azul;
});
const textMuertos = document.querySelectorAll('.textMuertos');
textMuertos.forEach(function(v) {
    v.style.color = negro;
});

canvasSim.width = width;
canvasSim.height = height;

canvasGraf.width = width;
canvasGraf.height = 100;

const estados = {
        INICIAL: 'inicial',
        INFECTADO: 'infectado',
        CURADO: 'curado',
        MUERTO: 'muerto'
}

let myrng;

const distancia = function(punto1, punto2) {
    let dx = punto1.x - punto2.x;
    let dy = punto1.y - punto2.y;
    // dx = dx.toFixed(5);
    // dy = dy.toFixed(5);
    // return Math.sqrt(dx * dx + dy * dy).toFixed(5);
    return Math.sqrt(dx * dx + dy * dy);
}

const getRandomInt = function(min, max) {
    // return Math.floor(Math.random() * (max - min)) + min;
    return Math.floor(myrng() * (max - min)) + min;
}

const tita = function(x, y) {
    // const arc = Math.atan(y / x).toFixed(5);
    // return x < 0 ? arc + Math.PI.toFixed(5) : arc;
    const arc = Math.atan(y / x);
    return x < 0 ? arc + Math.PI : arc;
}

const posicionValida = function(simulacion) {
    let x, y;
    let valida = false;
    while (!valida) {
        x = getRandomInt(radio + 1, width - radio);
        y = getRandomInt(radio + 1, height - radio);
        valida = true;

        if (x >= width / 2 - divisorWidth - radio && x <= width / 2 + divisorWidth + radio) valida = false;
        else {
            for (let i = 0; i < simulacion.puntos.length; i++) {
                if (distancia({x, y}, simulacion.puntos[i]) < 3 * radio) valida = false;
            }
        }

    }
    return [x,y];
}

function loop() {
    ctxSim.fillStyle = blanco;
    ctxSim.fillRect(0, 0, width, height);

    if (currentSimulation.aislamiento > 0) {
        ctxSim.strokeStyle = gris;
        ctxSim.beginPath(); 
        ctxSim.moveTo(width / 2 - divisorWidth, 0);
        ctxSim.lineTo(width / 2 - divisorWidth, 3 * currentSimulation.aislamiento);
        ctxSim.stroke();
        ctxSim.beginPath(); 
        ctxSim.moveTo(width / 2 - divisorWidth, height);
        ctxSim.lineTo(width / 2 - divisorWidth, height - 3 * currentSimulation.aislamiento);
        ctxSim.stroke();
        ctxSim.beginPath(); 
        ctxSim.moveTo(width / 2 + divisorWidth, 0);
        ctxSim.lineTo(width / 2 + divisorWidth, 3 * currentSimulation.aislamiento);
        ctxSim.stroke();
        ctxSim.beginPath(); 
        ctxSim.moveTo(width / 2 + divisorWidth, height);
        ctxSim.lineTo(width / 2 + divisorWidth, height - 3 * currentSimulation.aislamiento);
        ctxSim.stroke();
        ctxSim.beginPath(); 
        ctxSim.moveTo(width / 2 - divisorWidth, 3 * currentSimulation.aislamiento);
        ctxSim.lineTo(width / 2 + divisorWidth, 3 * currentSimulation.aislamiento);
        ctxSim.stroke();
        ctxSim.beginPath(); 
        ctxSim.moveTo(width / 2 - divisorWidth, height - 3 * currentSimulation.aislamiento);
        ctxSim.lineTo(width / 2 + divisorWidth, height - 3 * currentSimulation.aislamiento);
        ctxSim.stroke();
    }

    for (let i = 0; i < currentSimulation.puntos.length; i++) {
        currentSimulation.puntos[i].update();
        currentSimulation.puntos[i].collisionDetect();
        currentSimulation.puntos[i].draw();
    }

    contSanos.innerHTML = currentSimulation.sanos; 
    contInfectados.innerHTML = currentSimulation.infectados;
    contCurados.innerHTML = currentSimulation.curados;
    contMuertos.innerHTML = currentSimulation.muertos;
    
    ahora = Date.now();
    if (ahora - currentSimulation.t < (currentSimulation.tiempoSim + 1 ) * 1000) {
        if (ahora > currentSimulation.proxRefresco) {
            ctxGraf.beginPath(); 
            ctxGraf.moveTo(currentSimulation.grafIndex, 100);
            ctxGraf.lineTo(currentSimulation.grafIndex, 100 - (currentSimulation.infectados * 100 / currentSimulation.poblacion));
            ctxGraf.strokeStyle = rojo;
            ctxGraf.stroke();

            ctxGraf.beginPath(); 
            ctxGraf.moveTo(currentSimulation.grafIndex, 0);
            ctxGraf.lineTo(currentSimulation.grafIndex, currentSimulation.curados * 100 / currentSimulation.poblacion);
            ctxGraf.strokeStyle = azul;
            ctxGraf.stroke();
            
            currentSimulation.proxRefresco += currentSimulation.periodoRefresco;
            currentSimulation.grafIndex++;
        }
    }

    animationFrameId = window.requestAnimationFrame(loop);
}

currentSimulation = new Simulacion(
        inputPoblacion.value,
        inputMovilidad.value,
        inputIncubacion.value,
        inputMortalidad.value,
        inputAislamiento.value,
        inputTiempoSim.value,
        inputSemilla.value
    );

loop();
