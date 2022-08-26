const express = require('express')

const app = express()

require('dotenv').config()

const sequelize = require("./db");

const Link = require('./models');

sequelize.sync(() => console.log(`Ativou o banco de dados : ${process.env.DB_NAME}`));

app.listen(process.env.PORT, () => {
  console.log(`App está na porta ${process.env.PORT}`)
})

//função pra gerar code
function generateCode() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

// método de encurtar uma URL persistindo-a no banco de dados.
app.post('/new',express.json(),  async (req, res) => {
  const url = req.body.url;

  const code = generateCode();
  const date = new Date();
  const created = `${date.getDate().toString()}/${(date.getMonth() + 1).toString()}/${date.getFullYear().toString()}`;

  const resultado = await Link.create({
    url,
    code,
    created
  })

  res.send(`${process.env.DOMAIN}${code}`);
})




// método que retorna uma url encurtada conforme o encurtamento da URL.
app.get('/code/:code', async (req, res, next) => {
  const code = req.params.code;
 
  const resultado = await Link.findOne({ where: { code } });
  if (!resultado) return res.sendStatus(404);
 
  resultado.hits++;
  await resultado.save();
 
  res.send(resultado.url);
})

//método que retorna todas as URLs encurtadas em uma data específica.
app.post('/date', express.json(), async (req, res, next) => {
  const created = req.body.createdAt;

  const resultado = await Link.findAll({ where: { created } });
  if (!resultado) return res.sendStatus(404);

  for(var each in resultado){
    each.hits++
   
  }

  res.send(resultado)
 
})

//método que retorna uma url encurtada conforme um id.
app.get('/findById/:id', async (req, res, next) => {
  const id = req.params.id;
 
  const resultado = await Link.findOne({ where: { id } });

  const all = await Link.findAll({})

  console.log(all)

  if (!resultado) return res.sendStatus(404);
 
  resultado.hits++;
  await resultado.save();
 
  res.send(resultado.url);
})

