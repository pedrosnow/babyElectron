let index = {
    
    data: {
        celular: "",
        numeroLustrativo: "",
        chave: ""
    },

    init(){
        let buttons = ['Proximo', 'Iniciar']
        document.addEventListener('keypress', e => {
            if(e.key == "Enter")
            {

                let button = document.querySelectorAll("button")
                for(const row of button){

                    const result = buttons.find(index => index == row.textContent)
                    
                    result ? row.click() : ""
                }

                // let button = document.getElementById("btn-start")
                // button.click()
            }
        })

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
                this.data.chave = result
                this.sendMensagem()
            })
            .catch(error => console.log('error', error));

        }, 1000);

    },

    sendMensagem(){
        
        $('#descricao-modal').html(`Enviando o acesso para o numero ${this.data.numeroLustrativo}`)

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
                    $("#container-modal").remove()
                    this.avisoConexao()
                }else{
                    
                }
                
            })
            .catch(error => console.log('error', error));

        }, 1000);
    },

    avisoConexao(){

        $('body').prepend(`
        
        <div id="container-modal">
            <div class="container-aviso">
                <div class="card" id="card-aviso">
                <li class="close-card-aviso">+</li>
                <img src="./public/img/icons8-erro-96.png" width="100px" height="100px">
                    <div class="container-titulo-descricao">
                        <div class="titulo">Aviso!!</div>
                        <div class="descricao">Nenhuma conexão pôde ser feita porque a máquina de destino as recusou ativamente</div>
                        <button class="btn" id="button-gravar">Gravar, enviar depois</button>
                    </div>
                </div>
            </div>
        </div>
        
        `)

        document.querySelector(".close-card-aviso").addEventListener("click", ()=>{
            $("#container-modal").remove()
            window.location.reload()
        })
        
    }

   

   
}

index.init()