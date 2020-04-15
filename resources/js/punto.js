const Punto = function(simulacion) {
    this.simulacion = simulacion;

    [this.x, this.y] = posicionValida(this.simulacion);

    this.velX = myrng() * 2 * vel - vel;
    // this.velX = this.velX.toFixed(5);

    this.velY = Math.sqrt(vel * vel -  this.velX * this.velX);
    // this.velY = this.velY.toFixed(5);

    const plusOrMinus = myrng() < 0.5 ? -1 : 1;
    this.velY *= plusOrMinus;

    this.estado = estados.INICIAL;
    this.tContagio = 0;

    this.estatico = false;
}

Punto.prototype.draw = function() {
    ctxSim.beginPath();
    switch(this.estado) {
        case estados.INICIAL:
            ctxSim.fillStyle = gris;
            break;
        case estados.INFECTADO:
            ctxSim.fillStyle = rojo;
            break;
        case estados.CURADO:
            ctxSim.fillStyle = azul;
            break;
        case estados.MUERTO:
            ctxSim.fillStyle = negro;
            break;
    }

    ctxSim.arc(this.x, this.y, radio, 0, 2 * Math.PI);
    ctxSim.fill();
}

Punto.prototype.update = function() {
    // colisiones contra las paredes laterales
    if ((this.x + radio) >= width) this.velX = -(this.velX);
    if ((this.x - radio) <= 0) this.velX = -(this.velX);
    if ((this.y + radio) >= height) this.velY = -(this.velY);
    if ((this.y - radio) <= 0) this.velY = -(this.velY);

    // colisiones contra las paredes aislantes
    if (this.simulacion.aislamiento > 0) {
        if (this.y < 3 * this.simulacion.aislamiento || this.y > height - 3 * this.simulacion.aislamiento) {
            // if (this.x >= width / 2 - divisorWidth - radio && this.x <= width / 2 + divisorWidth + radio) {
            //     this.velX = -(this.velX);
            // }
            if (this.x > width / 2 - divisorWidth - radio && this.x < width / 2) {
                if (this.velX > 0) this.velX = -(this.velX);
            }
            if (this.x > width / 2 && this.x < width / 2 + divisorWidth + radio) {
                if (this.velX < 0) this.velX = -(this.velX);
            }
        } else if (this.x > width / 2 - divisorWidth && this.x < width / 2 + divisorWidth) {
            if (this.y > 3 * this.simulacion.aislamiento && this.y < 3 * this.simulacion.aislamiento + radio) {
                if (this.velY < 0) this.velY = -(this.velY);
                // this.velY = -(this.velY);
            }
            if (this.y > height - 3 * this.simulacion.aislamiento - radio && this.y < height - 3 * this.simulacion.aislamiento) {
                if (this.velY > 0) this.velY = -(this.velY);
                // this.velY = -(this.velY);
            }
        } else {
            const self = this;
            // coordenadas de los vertices
            const verticesDivisor = [
                {x: width / 2 - divisorWidth, y: 3 * this.simulacion.aislamiento},
                {x: width / 2 + divisorWidth, y: 3 * this.simulacion.aislamiento},
                {x: width / 2 - divisorWidth, y: height - 3 * this.simulacion.aislamiento},
                {x: width / 2 + divisorWidth, y: height - 3 * this.simulacion.aislamiento}
            ];
            // calculamos la distancia a las cuatro esquinas del aislante
            // y comprobamos la colision con cada una de esas cuatros esquinas
            const colision = verticesDivisor.find(function(vertice) {
                return distancia(self, vertice) < radio;
            });

            // en caso de colision modificamos las velocidades
            if (colision !== undefined) {
                // const velRelX = - this.velX;
                // const velRelY = - this.velY;
                // const nX = colision.x - this.x;
                // const nY = colision.y - this.y;
                // const prodEsc = velRelX * nX + velRelY * nY;

                // if (prodEsc < 0) {
                //     const v1 = Math.sqrt(this.velX * this.velX + this.velY * this.velY);

                //     const phi = Math.atan((this.y - colision.y) / (this.x - colision.x));

                //     this.velX = - v1 * Math.cos(phi);
                //     this.velY = - v1 * Math.sin(phi);
                // }
                this.velX = -(this.velX);
                this.velY = -(this.velY);
            }
        }
    }

    this.x += this.velX;
    this.y += this.velY;

    const ahora = Date.now();
    if (this.estado === estados.INFECTADO) {
        if (ahora - this.tContagio > this.simulacion.tIncubacion * 1000) {
            // if (Math.random() < this.simulacion.tasaMortalidad) {
            if (myrng() < this.simulacion.tasaMortalidad) {
                this.estado = estados.MUERTO;
                this.confinar();
                this.simulacion.infectados--;
                this.simulacion.muertos++;
            }
            else {
                this.estado = estados.CURADO;
                this.simulacion.infectados--;
                this.simulacion.curados++;
            }
        }
    }
}

Punto.prototype.infectar = function() {
    if (this.estado === estados.INICIAL) {
        this.estado = estados.INFECTADO;
        this.tContagio = Date.now();
        this.simulacion.infectados++;
        this.simulacion.sanos--;
    }
}

Punto.prototype.confinar = function() {
    this.velX = 0;
    this.velY = 0;
    this.estatico = true;
}

Punto.prototype.collisionDetect = function() {
    let puntos = this.simulacion.puntos;
    for (let i = 0; i < puntos.length; i++) {
        if (!(puntos[i].x === this.x && puntos[i].y === this.y)) {

            let velRelX = puntos[i].velX - this.velX;
            // velRelX = velRelX.toFixed(5);
            let velRelY = puntos[i].velY - this.velY;
            // velRelY = velRelY.toFixed(5);
            let nX = puntos[i].x - this.x;
            // nX = nX.toFixed(5);
            let nY = puntos[i].y - this.y;
            // nY = nY.toFixed(5);
            let prodEsc = velRelX * nX + velRelY * nY;
            // prodEsc = prodEsc.toFixed(5);

            if (distancia(this, puntos[i]) < 2 * radio && prodEsc < 0) {
                if (this.estado === estados.INFECTADO || puntos[i].estado === estados.INFECTADO) {
                    this.infectar();
                    puntos[i].infectar();
                }

                // const v1 = Math.sqrt(this.velX * this.velX + this.velY * this.velY).toFixed(5);
                // const v2 = Math.sqrt(puntos[i].velX * puntos[i].velX + puntos[i].velY * puntos[i].velY).toFixed(5);

                // const phi = Math.atan((this.y - puntos[i].y) / (this.x - puntos[i].x)).toFixed(5);

                const v1 = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
                const v2 = Math.sqrt(puntos[i].velX * puntos[i].velX + puntos[i].velY * puntos[i].velY);

                const phi = Math.atan((this.y - puntos[i].y) / (this.x - puntos[i].x));

                if (!this.estatico && !puntos[i].estatico) {
                    // 1 es this y 2 es contra el que colisiona
                    const tita1 = tita(this.velX, this.velY);
                    const tita2 = tita(puntos[i].velX, puntos[i].velY);

                    this.velX = v2 * Math.cos(tita2 - phi) * Math.cos(phi) + v1 * Math.sin(tita1 - phi) * Math.cos(phi + (Math.PI / 2))
                    this.velY = v2 * Math.cos(tita2 - phi) * Math.sin(phi) + v1 * Math.sin(tita1 - phi) * Math.sin(phi + (Math.PI / 2))
                    // this.velX = this.velX.toFixed(5);
                    // this.velY = this.velY.toFixed(5);

                    puntos[i].velX = v1 * Math.cos(tita1 - phi) * Math.cos(phi) + v2 * Math.sin(tita2 - phi) * Math.cos(phi + (Math.PI / 2))
                    puntos[i].velY = v1 * Math.cos(tita1 - phi) * Math.sin(phi) + v2 * Math.sin(tita2 - phi) * Math.sin(phi + (Math.PI / 2))
                    // puntos[i].velX = puntos[i].velX.toFixed(5);
                    // puntos[i].velY = puntos[i].velY.toFixed(5);
                }
                else if (this.estatico) {
                    puntos[i].velX = v2 * Math.cos(phi);
                    puntos[i].velY = v2 * Math.sin(phi);
                    // puntos[i].velX = puntos[i].velX.toFixed(5);
                    // puntos[i].velY = puntos[i].velY.toFixed(5);
                }
                else {
                    this.velX = - v1 * Math.cos(phi);
                    this.velY = - v1 * Math.sin(phi);
                    // this.velX = this.velX.toFixed(5);
                    // this.velY = this.velY.toFixed(5);
                }
            }
        }
    }
}