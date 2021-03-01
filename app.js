
const express = require('express');
const mysql = require('mysql');
const app = express();

const util = require('util');

const port = 3001

app.use(express.json());

require('dotenv').config();

const connection = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


connection.connect((error) => {
    if (error) {
        throw error();
    }
});



const qy = util.promisify(connection.query).bind(connection);

app.get('/api/personas', async (req, res) => {
    try {

        const query = 'select id, nombre, apellido from persona';

        const response = await qy(query);

        res.send(response);

    } catch (error) {
        res.send('la persona no existe');

    }

});

app.get('/api/personas/:id', async (req, res) => {
    try {

        const query = 'select * from persona where id=?';

        const response = await qy(query, [req.params.id]);

        if (response.length === 1) {

            res.send(response[0]);

        } else {
            res.status(404).send();
        }

    } catch (error) {
        res.send('La persona no existe');
    }
});

app.post('/api/persona', async (req, res) => {

try {

    const nombre = req.body.nombre;
    const apellido = req.body.apellido;
    const dni = req.body.dni;
   
    let query = 'select dni from persona where dni=?';

    let response = await qy(query,[dni]);

    if (response.length > 0) {

        throw new Error('La persona ya existe en nuestra base de datos');
    }

    query = 'insert into persona (nombre, apellido, dni) values (?,?,?)';

    response = await qy(query, [nombre, apellido, dni]);

    //res.send('La persona fue agregada');

    const registro =  await qy('select * from persona where id=?', [response.insertId]);
    

    res.json(registro[0]);

} catch (e) {
    console.error(e.message);
    res.status(413).send({ "error": e.message });
    
}

});


app.put('/api/personas/:id', (req, res)=>{



})



app.listen(port, () => {

    console.log(`Conexión exitosa a base de datos. Servidor escuchando en el puerto: ${port}`);
});
