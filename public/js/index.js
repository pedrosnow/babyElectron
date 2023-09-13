let index = {
    
    data: {
        celular: "",
        numeroLustrativo: "",
        chave: "",
        pacienteid: ""
    },

    
    proximo(e){

        let inputPaciente = document.getElementById('numero-paciente')
        let form = document.querySelector('#form')
        let buttonVoltar = document.getElementById("btn-voltar")

        if(inputPaciente.value != ""){
            
            this.data.pacienteid = inputPaciente.value

            form.innerHTML = ""
            form.append(this.celular())
            e.innerHTML = "Iniciar"
            e.removeAttribute('onclick')
            e.setAttribute('onclick', 'index.iniciarStram()')
            $(buttonVoltar).css({"display": "inline-block"})

            document.getElementById("cell").focus()
         
        }else{

            Swal.fire({
                title: 'Aviso!',
                text: "Para prosseguir é obrigatorio digitar codigo do paciente",
                icon: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok, entendi',
                allowOutsideClick: false
              })
        }
    },

    celular(){

        let container, col, label, input, row
        container = document.createElement('div')
        row = document.createElement('div')
        col = document.createElement('div')
        label = document.createElement('label')
        input = document.createElement('input')

        input.classList.add('form-control')
        input.placeholder = "Digite o numero no celular"
        label.innerHTML = "Nº Celular"
        input.id = "cell"
        $(input).mask('(00) 0 0000-0000');

        input.addEventListener('keyup', (event)=>{
            let numero = event.target.value.replace(/[\(\)\-\s]/g, '')
            this.data.celular = numero
            this.data.numeroLustrativo = event.target.value
        })

        col.append(label)
        col.append(input)
        col.classList.add('col')

        row.classList.add('row')
        row.append(col)

        container.append(row)

        return container

    },
    
    checkedNumber(e){
        e.value = e.value.replace(/[^0-9]/g, '');
    },

    iniciarStram(){

        $("body").prepend(`
            <div id="container-modal">
                <div class="container-loading">
                <div class="card" id="card-loading">
                    <span class="loader"></span>
                    <div class="container-titulo-descricao">
                    <div class="titulo">Carregando...</div>
                    <div class="descricao" id="descricao-modal">Gerando chave de acesso</div>
                    </div>
                </div>
                </div>
            </div>
        `)

        setTimeout(() => {
        
            fetch('http://localhost:5000/gerarchave',{
                method: "POST",
            })
            .then(response => response.text())
            .then(result => {
                this.data.chave = result.replace(/"/g, '').replace(/\n/g, '')
         
                $("#descricao-modal").html('Iniciando a live')

                setTimeout(() => {
                    this.controllStream()
                },2000);
                
            })
            .catch(error => console.log('error', error));

        }, 1000);

    },
    
    sendMensagem(){

        setTimeout(() => {
            
            fetch('http://localhost:5000/sendmensagem',{
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(this.data)
            })
            .then(response => response.text())
            .then(result => {

                let resultR = JSON.parse(result)

                if(resultR.erro){
                       
                    Swal.fire({
                        title: 'Erro!',
                        text: `Não foi possivel fazer o envio para o numero ${this.data.numeroLustrativo}, o servidor deve está off ou numero do celular não existe`,
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Sim',
                        cancelButtonText: 'Não',
                        allowOutsideClick: false,
                    })

                }
            })
            .catch(error => console.log('error', error));

        }, 1000);
    },

    controllStream(){

        fetch('http://localhost:5000/record_and_stream',{
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                chave: this.data.chave,
                pacienteid: this.data.pacienteid
            })
        })
        .then(response => response.text())
        .then(result => {

            if(result == "Erro: Erro ao iniciar a transmissão ao vivo"){

                Swal.fire({
                    title: 'Erro!',
                    text: "Não foi possivel iniciar a live porque o programar tentou se conectar ao dispotivo de audio ou de video e não conseguiu",
                    icon: 'warning',
                    showCancelButton: false,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sim',
                    cancelButtonText: 'Não',
                    allowOutsideClick: false,
                })

            }

        })
        .catch(error => console.log('error', error));

        $("body").html('')
        this.streamStart()

    },

    streamStart(){

        $("body").append(`

        <main class="container-stream">
            <div class="container-video">
            
            <div class="loading-video-stream">
                <div class="card" id="cardAviso">
                    <div class="titulo">Live Online <div class="circle"></div> </div>
                    <div class="descricao">Carregando a pre visualização</div>
                </div>
            </div>

            </div>
            <div class="container_options-button">
                
                <div class="container-send-number">
                    <div class="row">
                    <div class="col">
                        <label class="text-light">Enviando o Acesso</label>
                        <input type="text" class="form-control" value="(86) 9 95747604">
                    </div>
                    </div>
                    <div class="row">
                    <div class="col">
                        <button class="btn" id="enviar">00:40</button>
                    </div>
                    </div>
                </div>

                <button class="container-painel btn" id="encerrar">
                <div>E</div>
                <div>N</div>
                <div>C</div>
                <div>E</div>
                <div>R</div>
                <div>R</div>
                <div>A</div>
                <div>R</div>
                </button>
            </div>
        </main>

        <script>

        setTimeout(()=>{

            $(".container-video").html('<video id="videostram" class="video-js vjs-default-skin" controls autoplay data-setup="{}"></video>');
            
            const player = videojs('videostram');
            let retryCount = 0;
            const maxRetries = 4; // Número máximo de tentativas

            function loadVideo() {
                player.src({
                    src: 'http://localhost/hls/${this.data.chave}/index.m3u8',
                    type: 'application/x-mpegURL'
                });
                player.load();
                player.play();
            }

            player.ready(function () {
                this.controlBar.addChild('CurrentTimeDisplay');
                this.controlBar.addChild('TimeDivider');
                this.controlBar.addChild('DurationDisplay');
                this.controlBar.addChild('ProgressControl');
                this.controlBar.addChild('PlaybackRateMenuButton');

                loadVideo();
            });

            player.on('error', function (event) {
                const error = player.error();

                if (error.code === 2) {
                    // Verifica se ainda pode tentar novamente
                    if (retryCount < maxRetries) {
                        retryCount++;
                        // Tenta novamente após um breve intervalo (por exemplo, 5 segundos)
                        setTimeout(function () {
                            loadVideo();
                        }, 2000); // 5 segundos
                    } else {
                        // Excedeu o número máximo de tentativas, faça o que desejar aqui
                        console.log('Excedeu o número máximo de tentativas');
                    }
                }
            });
            
        },20000)

        </script>
        
        
        `)

        let time = 15

        let Time = setInterval(() => {

            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
          
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
          
            $("#enviar").html(`${formattedMinutes}:${formattedSeconds}`);
            
            if (time === 0) {
              clearInterval(Time);
              this.sendMensagem()
            }
          
            time = time - 1;


        }, 1000);

        document.getElementById("enviar").addEventListener("click", ()=>{
            clearInterval(Time)
            this.sendMensagem()
        })

        document.getElementById("encerrar").addEventListener("click", ()=>{

            Swal.fire({
                title: 'Aviso!',
                text: "Deseja encerrar a live ?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
                allowOutsideClick: false,
              }).then((result) => {

                if (result.isConfirmed) {

                    fetch('http://localhost:5000/stream/encerrar',{
                        method: "GET",
                        headers: {
                            "Content-Type":"application/json"
                        },
                    })
                    .then(response => response.text())
                    .then(result => {
                        
                        let response = JSON.parse(result)
                        
                        if(response.status == 200){

                            $("body").prepend(`
                            
                                <div id="container-modal">
                                    <div class="container-aviso-encerrando">
                                    <div class="card" id="card-viso-encerrando">
                                        <span class="loader"></span>
                                        <div class="container-titulo-descricao">
                                        <div class="titulo" id="titulo-encerrar">Encerrando</div>
                                        <div class="descricao" id="alerta-descricao-encerrando">A live esta sendo encerrada</div>
                                        </div>
                                    </div>
                                    </div>
                                </div>

                            `)

                           setTimeout(() => {

                            window.location.reload()

                           }, 3000);
                            

                        }else{
                            
                            Swal.fire({
                                title: 'Erro!',
                                text: "Algo inesperado aconteceu, contate o suporte!!",
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: '#3085d6',
                                cancelButtonColor: '#d33',
                                confirmButtonText: 'Sim',
                                cancelButtonText: 'Não',
                                allowOutsideClick: false,
                            })

                        }

                    })
                    .catch(error => console.log('error', error));
                 
                }
              })

            
            
        })

    },

    
    configuracao(){

        $("body").prepend(`
        
            <div id="container-modal">
                <div id="container-configuracao">
                    <div class="card" id="card-configuracao">
                        <div class="card-header">Configuração <li id="fechar-config">+</li> </div>
                            <div class="card-body">
                            <div id="option-config">
                                <ul>
                                    <li class="activate">Dispositivos</li>
                                    <li>Ffmpeg</li>
                                    <li>Conexao</li>
                                </ul>
                            </div>
                            <div id="container-config">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        
        `);

        document.getElementById("fechar-config").addEventListener("click", (event)=>{
            $("#container-modal").remove()
        })

        let remover_activate = () => {
            let li = document.querySelectorAll('li')

            li.forEach(element => {
                element.classList.remove('activate')
            });
        }

        let salvar = () => {
            $('#container-config').html(``)
        }

        let ffmpeg = () => {

            $('#container-config').html(`
            
                    <div class="row">
                        <div class="col" style="position: relative;" id="col-ffmpegf-largura">
                            <label>Largura</label>
                            <input type="text"class="form-control" id="largura-ffmpegf"> 
                            <li class="fas fa-check-circle" id="sucess-ffmpegf-largura" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>
                        <div class="col" style="position: relative;" id="col-ffmpegf-altura">
                            <label>Altura</label>
                            <input type="text"class="form-control" id="altura-ffmpegf"> 
                            <li class="fas fa-check-circle" id="sucess-ffmpegf-altura" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>
                    </div>
                    <br>
                    <div class="row">
                        <div class="col" style="position: relative;" id="col-ffmpegf-taxmostraudio">
                            <label>Taxa de mostragem de áudio</label>
                            <input type="text" class="form-control" id="taxamostragemaudui-ffmpegf">
                            <li class="fas fa-check-circle" id="sucess-ffmpegf-taxmostraudio" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>
                        <div class="col-4" style="position: relative;" id="col-ffmpegf-bitsaudio">
                            <label>Taxa de bits de áudio</label>
                            <input type="text" class="form-control" id="taxabitsaudio-ffmpegf">
                            <li class="fas fa-check-circle" id="sucess-ffmpegf-bitsaudio" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>
                    </div> 
                    <br>
                    <div class="row">

                        <div class="col" style="position: relative;" id="col-ffmpegf-codecaudio">
                            <label>codec audio</label>
                            <input type="text" class="form-control" id="codecaudio-ffmpegf">
                            <li class="fas fa-check-circle" id="sucess-ffmpegf-codecaudio" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>

                        <div class="col-4" style="position: relative;" id="col-ffmpegf-fps">
                            <label>fps</label>
                            <input type="text" class="form-control" id="fps-ffmpegf">
                            <li class="fas fa-check-circle" id="sucess-ffmpegf-fps" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>
                    </div> 
            
            `);

            fetch("http://localhost:5000/ffmpeg", {
                method: "POST",
            })
            .then(response => response.text())
            .then(result => {

                let response = JSON.parse(result)
                
                $('#largura-ffmpegf').val(response[0].largura)
                $('#altura-ffmpegf').val(response[0].altura)
                $('#taxamostragemaudui-ffmpegf').val(response[0].taxa_mostragem_audio)
                $('#taxabitsaudio-ffmpegf').val(response[0].tava_bits_audio)
                $('#codecaudio-ffmpegf').val(response[0].codec_audio)
                $('#fps-ffmpegf').val(response[0].fpd)


            })
            .catch(error => console.log('error', error));

            document.getElementById("largura-ffmpegf").addEventListener("keyup", (event)=>{

                $("#sucess-ffmpegf-largura").remove()

                if(!document.getElementById("loading-ffmpegf-largura")){

                    $("#col-ffmpegf-largura").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-ffmpegf-largura" style="position:absolute;right:24px;top:35px"></span>`)
                }
                
                fetch("http://localhost:5000/ffmpeg/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'largura', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-ffmpegf-largura").remove()

                    if(!document.getElementById("sucess-ffmpegf-largura")){

                        $("#col-ffmpegf-largura").append(`<li class="fas fa-check-circle" id="sucess-ffmpegf-largura" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            })


            document.getElementById("altura-ffmpegf").addEventListener("keyup", (event)=>{

                $("#sucess-ffmpegf-altura").remove()

                if(!document.getElementById("loading-ffmpegf-altura")){

                    $("#col-ffmpegf-altura").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-ffmpegf-altura" style="position:absolute;right:24px;top:35px"></span>`)
                }
                
                fetch("http://localhost:5000/ffmpeg/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'altura', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-ffmpegf-altura").remove()

                    if(!document.getElementById("sucess-ffmpegf-altura")){

                        $("#col-ffmpegf-altura").append(`<li class="fas fa-check-circle" id="sucess-ffmpegf-altura" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            })

            document.getElementById("taxamostragemaudui-ffmpegf").addEventListener("keyup", (event)=>{

                $("#sucess-ffmpegf-taxmostraudio").remove()

                if(!document.getElementById("loading-ffmpegf-taxmostraudio")){

                    $("#col-ffmpegf-taxmostraudio").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-ffmpegf-taxmostraudio" style="position:absolute;right:24px;top:35px"></span>`)
                }
                
                fetch("http://localhost:5000/ffmpeg/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'taxmostraudio', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-ffmpegf-taxmostraudio").remove()

                    if(!document.getElementById("sucess-ffmpegf-taxmostraudio")){

                        $("#col-ffmpegf-taxmostraudio").append(`<li class="fas fa-check-circle" id="sucess-ffmpegf-taxmostraudio" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            })

            document.getElementById("taxabitsaudio-ffmpegf").addEventListener("keyup", (event)=>{

                $("#sucess-ffmpegf-bitsaudio").remove()

                if(!document.getElementById("loading-ffmpegf-bitsaudio")){

                    $("#col-ffmpegf-bitsaudio").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-ffmpegf-bitsaudio" style="position:absolute;right:24px;top:35px"></span>`)
                }
                
                fetch("http://localhost:5000/ffmpeg/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'texabitsaudio', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-ffmpegf-bitsaudio").remove()

                    if(!document.getElementById("sucess-ffmpegf-bitsaudio")){

                        $("#col-ffmpegf-bitsaudio").append(`<li class="fas fa-check-circle" id="sucess-ffmpegf-bitsaudio" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            })


            document.getElementById("codecaudio-ffmpegf").addEventListener("keyup", (event)=>{

                $("#sucess-ffmpegf-codecaudio").remove()

                if(!document.getElementById("loading-ffmpegf-codecaudio")){

                    $("#col-ffmpegf-codecaudio").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-ffmpegf-codecaudio" style="position:absolute;right:24px;top:35px"></span>`)
                }
                
                fetch("http://localhost:5000/ffmpeg/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'codec', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-ffmpegf-codecaudio").remove()

                    if(!document.getElementById("sucess-ffmpegf-codecaudio")){

                        $("#col-ffmpegf-codecaudio").append(`<li class="fas fa-check-circle" id="sucess-ffmpegf-codecaudio" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            })

            document.getElementById("fps-ffmpegf").addEventListener("keyup", (event)=>{

                $("#sucess-conexao-fps").remove()

                if(!document.getElementById("loading-conexao-fps")){

                    $("#col-ffmpegf-fps").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-conexao-fps" style="position:absolute;right:24px;top:35px"></span>`)
                }
                
                fetch("http://localhost:5000/ffmpeg/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'fps', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-conexao-fps").remove()

                    if(!document.getElementById("sucess-conexao-fps")){

                        $("#col-ffmpegf-fps").append(`<li class="fas fa-check-circle" id="sucess-conexao-fps" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            })
        }

        let conexao = () => {

            $("#container-config").html(`
            
                <div class="row">
                    <div class="col" style="position: relative;" id="col-server-rmtp">
                        <label for="">Servidor RMTP</label>
                            <input type="text" class="form-control" id="serverrmtp">
                            <li class="fas fa-check-circle" id="sucess-conexao-rmtp" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                        </div>
                    </div>
                    <br>
                    <div class="row">
                    <div class="col" style="position: relative;" id="col-server-home">
                        <label>Servidor Principal</label>
                        <input type="text" class="form-control" id="homehttp">
                        <li class="fas fa-check-circle" id="sucess-conexao-home" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>
                    </div>
                </div> 
            
            `);
            
            fetch("http://localhost:5000/conexao", {
                method: "POST",
            })
            .then(response => response.text())
            .then(result => {
                
                let response = JSON.parse(result)
               
                $("#serverrmtp").val(response[0].rmtp)
                $("#homehttp").val(response[0].home)

            })
            .catch(error => console.log('error', error));


            document.getElementById("serverrmtp").addEventListener("keyup", (event)=>{{

                $("#sucess-conexao-rmtp").remove()

                if(!document.getElementById("#loading-conexao-rmtp")){

                    $("#col-server-rmtp").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-conexao-rmtp" style="position:absolute;right:24px;top:35px"></span>`)
                }

                fetch("http://localhost:5000/conexao/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'rmtp', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {
                    
                    $("#loading-conexao-rmtp").remove()

                    if(!document.getElementById("sucess-conexao-rmtp")){

                        $("#col-server-rmtp").append(`<li class="fas fa-check-circle" id="sucess-conexao-rmtp" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }

                })
                .catch(error => console.log('error', error));

            }})
            
            document.getElementById("homehttp").addEventListener("keyup", (event)=>{{

                $("#sucess-conexao-home").remove()

                if(!document.getElementById("#loading-conexao-home")){

                    $("#col-server-home").append(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true" id="loading-conexao-home" style="position:absolute;right:24px;top:35px"></span>`)
                }

                fetch("http://localhost:5000/conexao/edit", {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json"
                    },
                    body: JSON.stringify({'tipo': 'serverhome', 'valor': event.target.value})
                })
                .then(response => response.text())
                .then(result => {

                    $("#loading-conexao-home").remove()

                    if(!document.getElementById("sucess-conexao-home")){

                        $("#col-server-home").append(`<li class="fas fa-check-circle" id="sucess-conexao-home" style="position:absolute;right:20px;top:34px;color:green;font-size:20px"></li>`)
                    }
                })
                .catch(error => console.log('error', error));

            }})


        }

        let dispositivo = () => {

            $("#container-config").html(`
            
                <div class="row">
                    <div class="col">
                        <label for="">Dispositiv de Video</label>
                        <select name="dispoaudio" id="dispovideo" class="form-control">
                        <option value="null">nenhum dispositivo selecionado</option>
                        </select>
                    </div>
                    </div>
                    <br>
                    <div class="row">
                    <div class="col">
                        <label for="">Dispositiv de audio</label>
                        <select name="dispoaudio" id="dispoaudio" class="form-control">
                            <option value="null">nenhum dispositivo selecionado</option>
                        </select>
                    </div>
                    </div>
                    <br>
                    <div class="row" id="container-atualizar-dispositivo">
                    <div class="col">
                        <button class="btn btn-success" id="btn-atualizar"><li class="	fas fa-redo-alt"></li></button>
                    </div>
                </div> 
            
            `);

           let dispoinput = () =>{

                $("#dispovideo").html('')
                $("#dispoaudio").html('')

                fetch('http://localhost:5000/dispositivos',{
                    method: "POST"
                })
                .then(response => response.text())
                .then(result => {
                    
                    let dispositivos = JSON.parse(result)

                    // Arrays para dispositivos de vídeo e áudio
                    const dispositivosVideo = [];
                    const dispositivosAudio = [];

                    // Iterar pelos dispositivos e separá-los com base no nome
                    dispositivos.forEach(dispositivo => {
                        if (dispositivo.name.toLowerCase().includes('video') || dispositivo.name.toLowerCase().includes('camera')) {
                            dispositivosVideo.push(dispositivo);
                        } else if (dispositivo.name.toLowerCase().includes('audio')) {
                            dispositivosAudio.push(dispositivo);
                        }
                    });

                    for(const row of dispositivosVideo){
                        $("#dispovideo").append(`<option value="${row.name}" ${row.selected}>${row.name}</option>`)
                    }
                    
                    for(const row of dispositivosAudio){
                        $("#dispoaudio").append(`<option value="${row.name}" ${row.selected}>${row.name}</option>`)
                    }

                    
                })
                .catch(error => console.log('error', error));

           }

           dispoinput()

           document.getElementById("btn-atualizar").addEventListener("click", ()=>{
                dispoinput()
           })

           document.getElementById("dispovideo").addEventListener("change", (event)=>{

                $('#container-config').append(`<div class="modal-loading">
                    <span id="loading-modal"></span>
                </div>`)
                
                setTimeout(() => {
                    fetch('http://localhost:5000/updateDispositivo',{
                        method: "POST",
                        headers: {
                            "Content-Type":"application/json"
                        },
                        body: JSON.stringify({'dispositivo': event.target.value, "tipo": "video"})
                    })
                    .then(response => response.text())
                    .then(result => {
                        $('.modal-loading').remove()
                    })
                    .catch(error => console.log('error', error));
                }, 200);

           })
           
           document.getElementById("dispoaudio").addEventListener("change", (event)=>{

                $('#container-config').append(`<div class="modal-loading">
                    <span id="loading-modal"></span>
                </div>`)
                
                setTimeout(() => {
                    fetch('http://localhost:5000/updateDispositivo',{
                        method: "POST",
                        headers: {
                            "Content-Type":"application/json"
                        },
                        body: JSON.stringify({'dispositivo': event.target.value, "tipo": "audio"})
                    })
                    .then(response => response.text())
                    .then(result => {
                        $('.modal-loading').remove()
                    })
                    .catch(error => console.log('error', error));
                }, 200);

           })


        }

        let opcoes = {'Dispositivos': dispositivo, "Conexao": conexao, "Ffmpeg": ffmpeg, "Salvar": salvar}

        let li = document.querySelectorAll('li')

        opcoes['Dispositivos']()

        li.forEach(element => {
            element.addEventListener('click', (event)=>{
                remover_activate()
                element.classList.add('activate')
                opcoes[element.textContent]()
            })
        });

    },

    
    // Processo(){
        
    //     let enviado = 0
    //     let max = 0
    //     let index = 0
    //     let control = []
    //     let erro = []

    //     $("main").append(`
    //         <div id="container-prgresso">
    //             <div class="spinner-border" style="width: 2.5rem; height: 2.5rem;" role="status"></div>
    //                 <div class="container-titulo-progresso">
    //                 <div class="titulo">Processando <span class="badge badge-secondary" style="background: #000" id="indicator">0</span></div>
    //                 <div class="progresso" id="processo-after">
    //                     Verificando...
    //                 </div>
    //             </div>
    //         </div>
    //     `)

    //     fetch("http://localhost:5000/processo/verificar", {
    //         method: 'POST',
    //     })
    //     .then(response => response.text())
    //     .then(result => {

    //         const response = JSON.parse(result)

    //         max = response.length
    //         for(const row of response){
    //             control.push(row)
    //         }

    //         if(response.length == 0){
    //             $("#container-prgresso").remove()
    //         }
            
    //         let processo = () => {

    //             $("#processo-after").html('1/2 Processando o arquivo')
    //             $("#indicator").html(max)

    //            setTimeout(() => {
    //                 fetch('http://localhost:5000/converte',{
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type":"application/json"
    //                     },
    //                     body: JSON.stringify({'name_file': control[index].chave})
    //                 })
    //                 .then(response => response.text())
    //                 .then(result => {

    //                     $("#processo-after").html('2/2 Enviando o arquivo')

    //                     setTimeout(() => {
                            
                              
    //                     fetch('http://localhost:5000/uploadFile',{
    //                         method: "POST",
    //                         headers: {
    //                             "Content-Type":"application/json"
    //                         },
    //                         body: JSON.stringify({'chave': control[index].chave})
    //                     })
    //                     .then(response => response.text())
    //                     .then(result => {

    //                         if(!result == "erro"){

    //                             $("#processo-after").html('Enviado com sucesso')

    //                             enviado = enviado + 1
        
    //                             setTimeout(() => {
                                    
    //                                 if(enviado < max){
    //                                     index = index + 1
    //                                     processo()
    //                                 }else{
    //                                     if(erro.length == 0){

    //                                         $("#container-prgresso").remove()

    //                                     }else{

    //                                         control = control.splice(0, control.length)
                                            
    //                                         for(const row of erro){
    //                                             control.push(row)
    //                                         }
    //                                     }
    //                                 }
        
    //                             }, 1000);

    //                         }else{

    //                             $("#indicator").html('Não foi possivel enviar')
    //                             $("#processo-after").html('Programa vai ficar tentando até conseguir')

    //                             erro.push(control[index])

    //                             setTimeout(() => {
    //                                 processo()
    //                             }, 1000);
    //                         }
                        
    //                     })
    //                     .catch(error => console.log('error', error));

    //                     }, 2000);

    //                 })
    //                 .catch(error => console.log('error', error));

    //            }, 100000);
    //         }            
    //         processo()

    //     })
    //     .catch(error => console.log('error', error));

        // console.log(max)

     

        // console.log(this.data)

        

        // setTimeout(() => {

        //     $("#titulo-encerrar").html('Carregando...')
        //     $("#alerta-descricao-encerrando").html('Convertendo o arquivos para o formato suportado')

       

        // }, 1500);

    // },

  
   
}


