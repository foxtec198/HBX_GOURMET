params = new URLSearchParams(window.location.search) // Pega os parametros da page
cr = params.get('cr')
server = 'https://api.hubbix.com.br/'
// server = 'http://localhost:9560/'
let api = server + '/gourmet/api/v1/'
let categorias;

function request(url, method='GET', data){
    if(!data){
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'cr' : `${cr}`,
            }
        };
    }else{
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'cr' : `${cr}`,
            },
            body: JSON.stringify(data)
        };
    }

    try{return fetch(api + url, options)}
    catch{err => {toast("Erro interno - " + err)}}

}

function change_theme(){
    const tema = document.body.getAttribute("data-bs-theme")
    if(tema == 'light'){
        document.body.setAttribute("data-bs-theme", "dark");
    }else{
        document.body.setAttribute("data-bs-theme", "light");
    }

}

function real(str){ // Converte STR/INT em Moeda R$
    str = parseFloat(str)
    return str.toLocaleString('pt-br', {style:'currency', currency:'BRL'})
}

async function get_prods(){
    const req = await request('produtos')
    const res = await req.json()
    const ctgs = new Array;
    const list_ctg = document.getElementById('lista_categorias')
    const ctgs_ls = document.getElementById('ctgs')

    if(req.ok){
        res.forEach(item => {
            ctgs.push(item.categoria)
        })

        categorias = new Set(ctgs)
        categorias.forEach(item => {
            const li = document.createElement('li')
            li.classList.add('nav-item')
    
            const a = document.createElement('a')
            a.classList.add('nav-link')
            a.href = `#${item}`
            a.textContent = item
            a.addEventListener('click', function(){
                // Seta o atual como ativo
                this.classList.add('active', 'fw-bold')
                // Desativa os demais
                document.querySelectorAll('.nav-link').forEach(items =>{
                    items.classList.remove('active', 'fw-bold')
                })
            })
    
            li.appendChild(a)
            list_ctg.appendChild(li)
    
            const ac_item = document.createElement('div')
            ac_item.classList.add('accordion-item')
            ac_item.id = item
    
            const ac_header = document.createElement('h2')
            ac_header.classList.add('accordion-header')
    
            const ac_btn = document.createElement('button')
            ac_btn.classList.add('accordion-button', 'fw-bold')
            ac_btn.type = 'button'
            ac_btn.setAttribute('data-bs-toggle', 'collapse')
            ac_btn.setAttribute('data-bs-target', `#ac_${item}`)
            ac_btn.textContent = item
    
            ac_header.appendChild(ac_btn)
    
            const ac = document.createElement('div')
            ac.classList.add('accordion-colapse', 'collapse', 'show')
            ac.id = `ac_${item}`
    
            const ac_body = document.createElement('div')
            ac_body.classList.add('accordion-body', 'd-flex', 'flex-wrap', 'p-2', 'gap-2')
            ac_body.id = `ac_body_${item}`
    
            ac.appendChild(ac_body)
    
            ac_item.appendChild(ac_header)
            ac_item.appendChild(ac)
    
            ctgs_ls.appendChild(ac_item)
        })
    
        
        res.forEach(item => {
            if(item.valor > 0){
                const dvProd = document.createElement('div')
                dvProd.classList.add('card', 'd-flex', 'flex-grow-1')
                dvProd.style.flexBasis = '300px'
                dvProd.style.maxWidth = '330px'
    
                const cardH = document.createElement('div')
                cardH.classList.add('card-header')
                if(item.quantidade <= 0){
                    cardH.innerHTML = `
                    <div class='d-flex justify-content-between'>
                        <span>${item.nome}</span>
                        <span class='badge text-bg-danger'>Sem estoque!</span>
                    </div>
                    `
                }else{
                    cardH.textContent = item.nome
                }

                const cardB = document.createElement('div')
                cardB.classList.add('card-body', 'd-flex', 'justify-content-center')
                const img = document.createElement('img')
                img.classList.add('img-fluid', 'img-thumbnail')
                img.style.objectFit = 'cover'
                img.style.objectPosition = 'center'
                img.style.width = '200px'
                img.style.height = '200px'
                if(item.img !== 'blank.png'){img.src = server + 'img/gourmet/' + item.img}
                else{img.src = server + 'img/blank.png'}
                if(item.quantidade <= 0){img.style.filter = 'grayscale(100%)'}
                cardB.appendChild(img)

                const cardF = document.createElement('div')
                cardF.classList.add('card-header')

                const spNome = document.createElement('span')
                spNome.classList.add('fs-3', 'fw-bold')
                spNome.textContent = real(item.valor)
                
                cardF.appendChild(spNome)
                
                dvProd.appendChild(cardH)
                dvProd.appendChild(cardB)
                dvProd.appendChild(cardF)
                
                document.getElementById(`ac_body_${item.categoria}`).appendChild(dvProd)
            }
        })
    }
    

    

}

async function get_loja(){
    const req = await request('get_loja/' + cr)
    const res = await req.json()

    document.querySelectorAll('.logo').forEach(item =>{
        item.src = server + 'img/gourmet/' + res.logo
    })

    document.querySelectorAll('#nome_loja').forEach(item => {
        item.textContent = res.nome
        item.classList.remove('placeholder')
    })

}

get_loja()
get_prods()