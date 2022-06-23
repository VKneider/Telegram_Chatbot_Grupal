const Telebot = require('telebot');
const TOKEN = {
    token: "5573269354:AAGYsm48IfrPZal9EnhfMJ6qiM2hMVnPcLI"
};
const ENDPOINT = 'https://fakestoreapi.com/products';
const axios = require('axios');

const instance = axios.create({
    baseURL: 'https://some-domain.com/api/',
    timeout: 1000
});
const translate = require('translate-google')



const BUTTONS = {

    productos: {
        label: 'Mostrar productos',
        command: '/productos'
    },
    pagos: {
        label: 'Mostrar metodos de pago',
        command: '/pagos'
    },
    entrega: {
        label: 'Ver zonas de entrega y horario de trabajo',
        command: '/entrega'
    },
    buscar: {
        label: 'Elegir producto',
        command: '/buscar'
    },
    inicio: {
        label: 'Regresar a inicio',
        command: '/start'
    },
    carrito: {
        label: 'Agregar un producto al carro de compras',
        command: '/carrito'
    },
    buscarOtro: {
        label: 'Elegir otro producto',
        command: '/buscar'
    },
    verCarrito: {
        label: 'Ver el carrito de compras',
        command: '/verCarrito'
    }


}

const bot = new Telebot({
    token: '5573269354:AAGYsm48IfrPZal9EnhfMJ6qiM2hMVnPcLI',
    usePlugins: ['namedButtons', 'askUser'],
    pluginConfig: {
        namedButtons: {
            buttons: BUTTONS
        }
    }
});





//Ver productos 
bot.on('/productos', (msg) => {
    async function getProductos() {
        try {
            const respuesta = await axios.get(ENDPOINT);
            let productos = respuesta.data;
            let resultado = `id  |  Nombre                           |  Precio\n`;
            let len = productos.length;
            let i = 0;
            for (; i < len; i++) {
                resultado += `${productos[i].id}  | ${productos[i].title.substring(0,20)} | $${productos[i].price} \n`;
            }
            return bot.sendMessage(msg.chat.id, ` ${resultado}`);
        } catch (error) {
            console.log(error);
        }
    }


    getProductos()
    let replyMarkup = bot.keyboard([ [BUTTONS.inicio.label, BUTTONS.buscar.label]], {
        resize: true
    });

    return bot.sendMessage(msg.from.id, 'Elija entre las siguientes opciones', {
        replyMarkup
    });

});

//Buscar producto
bot.on('/buscar', (msg) => {

    let texto="A continuacion introduzca el id del producto que desea consultar";
    
    return bot.sendMessage(msg.chat.id, ' A continuacion introduzca el id del producto que desea consultar', {
        ask: 'id'
    });

})


//Mostrar producto
bot.on('ask.id', msg => {
    const id = Number(msg.text);

    if (!id) {
        return bot.sendMessage(msg.chat.id, 'Introduzca un id valido. Ej: 2', {
            ask: 'id'
        });
    } else {
        async function getProductID(id) {
            const respuesta = await axios.get(ENDPOINT + `/${id}`);
            let producto = respuesta.data;
            let resultado = `id: ${producto.id}\n Nombre: ${producto.title}\n 
            Precio: $${producto.price} \n Descripcion: \n ${producto.description} \n ${producto.image} \n
            Categoria: ${producto.category}\n
            Valoracion: promedio ${producto.rating.rate} de ${producto.rating.count} valoraciones \n`;

            return bot.sendMessage(msg.chat.id, `${resultado}`);
        }
        getProductID(id)
        let replyMarkup = bot.keyboard([
            [BUTTONS.buscarOtro.label],
            [BUTTONS.carrito.label],
            [BUTTONS.inicio.label]
        ], {
            resize: true
        });
        return bot.sendMessage(msg.chat.id, 'Aqui se encuentra el producto solicitado', {
            replyMarkup
        });

    }

})




function  traducir (text,msg,replyMarkup){

    if(!replyMarkup){
        
        translate(text, {to: 'es'}).then(res => {
            
            bot.sendMessage(msg.from.id, res  ) })
            .catch(err => {
            console.error(err)
        });
    } else {

        for(let i=0; i<replyMarkup.keyboard.length;i++){

            for (let j in  replyMarkup.keyboard[i]){
                
             translate(replyMarkup.keyboard[i], {to: 'en'}).then(res=> {
            replyMarkup.keyboard[i]=res;
            

             }).catch(err => {
                console.error(err)
            });

            }
        }
        translate(text, {to: 'en'}).then(res => {
            
            bot.sendMessage(msg.from.id, res, { replyMarkup }  ) })
            .catch(err => {
            console.error(err)
        });

            
        }

    }


function traducirBotones(arrayLabels, msg){

    


}

bot.on('/pagos', (msg) => {

    texto= `Los metodos de pago son: \n
    - Efectivo 

    
    - Transferencia 

    
    - Criptomonedas recibidas:
        *BTC
        *ETH
        *USTD`

   return traducir(texto, msg);
});


// menu inicial

bot.on('/start', (msg) => {

    let replyMarkup = bot.keyboard([
        [BUTTONS.productos.label, BUTTONS.pagos.label],
        [BUTTONS.entrega.label]
    ], {
        resize: true
    });

    
    let texto = 'Bienvenido a la tienda. \n Elija la opcion de su preferencia';
    return traducir(texto,msg,replyMarkup)
    
    

});


bot.start();

