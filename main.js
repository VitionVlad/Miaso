var locked = true;

var minushp = 1;

function unlock(){
    locked = false;
}

function eas(){
    minushp = 1;
}


function har(){
    minushp = 10;
}


function med(){
    minushp = 5;
}

function main(){
    var attack = false;
    var hp = 100;
    var level = 1;
    const speed = 0.1;
    const sensivity = 1;
    var eng = new Engine("#render", postproces, true, true, 4000);
    //eng.playerphysics = false;
    eng.pos.z = -1.0;
    eng.pos.y = -2.7;
    eng.rot.x = 0.0;
    eng.rot.y = 0.0;

    eng.useorthosh = true;
    eng.sfar = 200.0;
    eng.sfov = 40.0;
    eng.shadowpos.z = -20.0;
    eng.shadowpos.y = -40.7;
    eng.shadowrot.y = 0.7;
    eng.shadowrot.x = -0.7;
    eng.setLight(0, new vec3(0, 1, 1), new vec3(1, 1, 1), 1);

    var tesakangle = 0;
    function mousecallback(){
        document.addEventListener("mousemove", function(event){
            eng.rot.x += ((event.movementX) / (eng.gl.canvas.width/2))/sensivity;
            eng.rot.y += ((event.movementY) / (eng.gl.canvas.height/2))/sensivity;
            if(eng.rot.y > 1.5){
                eng.rot.y = 1.5;
            }
            if(eng.rot.y < -1.5){
                eng.rot.y = -1.5;
            }
        }, false);     
        document.getElementById("render").onclick = function(){
            document.getElementById("render").requestPointerLock();
            attack = true;
            tesakangle = 25;
        };
    }

    var resolution = new vec2(eng.canvas.width, eng.canvas.height);
    var x, y;
    var stillt = false;
    var touchHandler = function(event) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    }
    var begtouch = function(event) {
        stillt = true;
    }
    var endtouch = function(event) {
        stillt = false;
    }
    function cth(){
        eng.pos.z += Math.cos(eng.rot.y) * Math.cos(eng.rot.x) * speed;
        eng.pos.x -= Math.cos(eng.rot.y) * Math.sin(eng.rot.x) * speed;
        var touchpos = new vec2(x, y);
        if(stillt === true){
            if(touchpos.x < resolution.x/2){
                eng.rot.x += ((((touchpos.x/resolution.x)*2)*2)-1)/100;
                eng.rot.y -= ((((-touchpos.y/resolution.y)*2) +1)*0.01);
            }else if(touchpos.x > resolution.x/2){
                attack = true;
                tesakangle = 25;
            }
        }
    }
    eng.canvas.addEventListener("touchmove", touchHandler);
    eng.canvas.addEventListener("touchstart", begtouch);
    eng.canvas.addEventListener("touchend", endtouch);

    var ground = new Mesh(ground1v, ground1n, ground1u, standartFragmentShaderNoCubemap, standartVertexShader, eng, pavcol, pavspec, pavnorm, pavcolx, pavcoly, true, null);

    var box = new Mesh(boxv, boxn, boxu, standartFragmentShaderNoCubemap, standartVertexShader, eng, bcol, bspec, bnorm, bcolx, bcoly, true, null);

    var f1 = new Mesh(fencev, fencen, fenceu, standartFragmentShaderNoCubemap, standartVertexShader, eng, wcol, wspec, wnorm, wcolx, wcoly, true, null);
    f1.pos.x = -4;
    var f2 = new Mesh(fencev, fencen, fenceu, standartFragmentShaderNoCubemap, standartVertexShader, eng, wcol, wspec, wnorm, wcolx, wcoly, true, null);
    f2.pos.x = 4;
    var f3 = new Mesh(fencev, fencen, fenceu, standartFragmentShaderNoCubemap, standartVertexShader, eng, wcol, wspec, wnorm, wcolx, wcoly, true, null);
    f3.pos.z = 10;
    f3.rot.y = eng.toRadians(90);
    f3.scale.z = 0.4;

    var tesak = new Mesh(tesakv, tesakn, tesaku, axefshader, axevshader, eng, axc, axs, axn, axcx, axcy, false, null);
    tesak.pos.y = -0.1;

    var eye = new Array(100);
    var eyeact = new Array(100);

    for(var i = 0; i != 100; i+=1){
        eye[i] = new Mesh(eyev, eyen, eyeu, standartFragmentShaderNoShadowMapingMoCubemap, standartVertexShader, eng, ecol, espec, enorm, ecolx, ecoly, false, null);
        eye[i].pos.z = i*-20 -4;
        eye[i].pos.y = 0.5;
        eye[i].rot.x = -eng.toRadians(15);
        eyeact[i] = false;
    }
    eyeact[0] = true;

    var zsw = 9;
    
    mousecallback();
    drawFrame();
    var fcnt = 0;
    function drawFrame(now){
        document.getElementById("hp").innerHTML = "HP: " + hp;
        document.getElementById("lv").innerHTML = "Level: " + level;
        eng.shadowpos.z = eng.pos.z;
        if(eng.pos.z >= zsw){
            zsw += 20;
            eng.pos.z = 0;
            level += 1;
            for(var i = 0; i !== level; i += 1){
                eyeact[i] = true;
                eye[i].pos.z = i*-20 -4;
                eye[i].pos.x = 0;
            }
        }
        eng.beginShadowPass();

        f3.Draw(eng);
        for(var i = 0; i != level; i += 1){
            ground.pos.z = -i * 20;
            box.pos.z = -i * 20 - 2;
            f1.pos.z = -i * 20;
            f2.pos.z = -i * 20;
            ground.Draw(eng);
            box.Draw(eng);
            f1.Draw(eng);
            f2.Draw(eng);
            eye[i].rot.y = eng.rot.x;
            if(eyeact[i] === true){
                eye[i].Draw(eng);
            }
        }

        eng.beginFrame();
        tesak.pos.z = Math.sin(fcnt/50)/50+0.5;
        tesak.rot.x = eng.toRadians(tesakangle);
        if(tesakangle !== 0){
            tesakangle -= 1;
        }else{
            attack = false;
        }
        if(locked === false){
            cth();
        }

        tesak.Draw(eng);
        f3.Draw(eng);
        for(var i = 0; i != level; i += 1){
            ground.pos.z = -i * 20;
            box.pos.z = -i * 20 - 2;
            f1.pos.z = -i * 20;
            f2.pos.z = -i * 20;
            ground.Draw(eng);
            box.Draw(eng);
            f1.Draw(eng);
            f2.Draw(eng);
            if(eyeact[i] === true){
                if(eye[i].pos.x > -eng.pos.x && locked === false){
                    eye[i].pos.x -= 0.1;
                }
                if(eye[i].pos.x < -eng.pos.x && locked === false){
                    eye[i].pos.x += 0.1;
                }
                if(eye[i].pos.z > -eng.pos.z && locked === false){
                    eye[i].pos.z -= 0.1;
                }
                if(eye[i].pos.z < -eng.pos.z && locked === false){
                    eye[i].pos.z += 0.1;
                }
                eye[i].Draw(eng);
                if(eye[i].interacting === true && attack === true){
                    eyeact[i] = false;
                }else if(eye[i].interacting === true && attack !== true){
                    hp -= minushp;
                }
            }
        }

        eng.endFrame(drawFrame, now);
        fcnt += 1;
        if(hp <= 1 || level >= 100){
            level = 1;
            eng.pos.z = 0;
            hp = 100;
            zsw = 9;
        }
    }
}

window.onload = main;
