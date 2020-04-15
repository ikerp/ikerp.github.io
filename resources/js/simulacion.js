const Simulacion = function(poblacion, confinados, tIncubacion, tasaMortalidad, aislamiento, tiempoSim, semilla) {

    let devSeed = '';
    if (semilla) {
        // extraemos los parametros de la simulacion de la semilla
        this.poblacion = Number(semilla.slice(0, 3));
        this.confinados = Number(semilla.slice(3, 6));
        this.tIncubacion = Number(semilla.slice(6, 9));
        this.tasaMortalidad = Number(semilla.slice(9, 12));
        this.aislamiento = Number(semilla.slice(12, 15));

        // extraemos la semilla
        devSeed = semilla.slice(-8);

        // ajustamos los parametros en pantalla
        inputPoblacion.value = this.poblacion;
        inputMovilidad.value = this.confinados;
        inputIncubacion.value = this.tIncubacion;
        inputMortalidad.value = this.tasaMortalidad;
        inputAislamiento.value = this.aislamiento;

        // copiamos la semilla al label correspondiente
        lblSemilla.innerHTML = semilla;
    } else {
        // extramos los parametros de simulacion de los parametros de entrada
        this.poblacion = poblacion;
        this.confinados = confinados;
        this.tIncubacion = tIncubacion;
        this.tasaMortalidad = tasaMortalidad;
        this.aislamiento = aislamiento;
        // generamos la nueva semilla
        let userSeed = '';
        userSeed += String(poblacion).padStart(3, '0');
        userSeed += String(confinados).padStart(3, '0');
        userSeed += String(tIncubacion).padStart(3, '0');
        userSeed += String(tasaMortalidad).padStart(3, '0');
        userSeed += String(aislamiento).padStart(3, '0');
        for (let i = 0; i < 8; i++) {
            const randomCode = Math.floor(Math.random() * (122 + 1 - 97)) + 97;
            devSeed += String.fromCharCode(randomCode);
        }  
        userSeed += devSeed;
        lblSemilla.innerHTML = userSeed;
    }
    this.sanos = poblacion;
    this.tiempoSim = tiempoSim;

    // correcciones
    this.tasaMortalidad /= 100;
    this.aislamiento = Math.min(this.aislamiento, 100);

    myrng = new Math.seedrandom(devSeed);

    this.infectados = 0;
    this.curados = 0;
    this.muertos = 0;

    this.puntos = [];
    for (let i = 0; i < this.poblacion; i++) { 
        this.puntos.push(new Punto(this));
    }
    for (let i = 0; i < this.confinados; i++) {
        this.puntos[i].confinar();
    }          
    this.puntos[this.confinados].infectar();

    this.periodoRefresco = tiempoSim / width * 1000;
    this.t = Date.now();
    this.proxRefresco = this.t + this.periodoRefresco;

    this.grafIndex = 0;

    ctxGraf.fillStyle = blanco;
    ctxGraf.fillRect(0, 0, width, 100);
    ctxGraf.strokeStyle = gris;
    for (let i = 0; i < 3; i++) {
        ctxGraf.beginPath(); 
        ctxGraf.moveTo(0, (i + 1) * 25);
        ctxGraf.lineTo(width, (i + 1) * 25);
        ctxGraf.stroke();
    }
    const divisionesGraf = 6;
    for (let i = 0; i < divisionesGraf - 1; i++) {
        ctxGraf.beginPath(); 
        ctxGraf.moveTo((i + 1) * width / divisionesGraf,0);
        ctxGraf.lineTo((i + 1) * width / divisionesGraf,100);
        ctxGraf.stroke();
    }
}