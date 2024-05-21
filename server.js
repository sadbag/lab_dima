import Fastify from 'fastify'
import { Sequelize, Model, DataTypes } from 'sequelize';

const fastify = Fastify({
    logger: true
})

const sequelize = new Sequelize('postgres://student:student@db:5432/student_db')

class Turtles extends Model { }

Turtles.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: DataTypes.STRING,
    role: DataTypes.STRING
}, { sequelize, modelName: 'turtles' });

try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

fastify.get("/turtles", async function handler(request, reply) {
    const { query, limit = 10, offset = 0 } = request.query;
    let filteredTurtles = await Turtles.findAll();
  
    if (query) {
      filteredTurtles = filteredTurtles.filter((turtles) =>
        turtles.name.includes(query)
      );
    }
    const paginatedTurtles = filteredTurtles.slice(offset, offset + limit);
    reply.send({ data: paginatedTurtles });
  });

  fastify.post("/turtles", async (request, reply) => {
    const { id, name, role } = request.body;
    let createTurtle = await Turtles.create({ id,name, role });
    await createTurtle.save();
    reply.code(201).send({ message: "Character created successfully" });
  });

  fastify.put("/turtles/:id", async (request, reply) => {
    const { id } = request.params;
    const { name, role } = request.body;
    let turtle = await Turtles.findOne({ where: { id } });
    await Turtles.update(
      {
        name,
        role,
      },
      { where: { id } }
    );
    reply.code(200).send({ message: "Turtle updated successfully" });
  });
  
  //обновление записи частично
  fastify.patch("/turtles/:id", async (request, reply) => {
    const { id } = request.params;
    const updates = request.body;
  
    // Поиск ресурса по id в базе данных
    let turtle = await Turtles.findOne({ where: { id } });
  
    if (!turtle) {
      reply.code(404).send({ error: "Resource not found" });
      return;
    }
  
    // Обновляем ресурс
    await Turtles.update(updates, { where: { id } });
  
    // Получаем обновленный ресурс
    turtle = await Turtles.findOne({ where: { id } });
  
    // Возвращаем обновленный ресурс
    reply.code(200).send({ message: "Turtle updated successfully", turtle });
  });
  
  
  fastify.delete("/turtles/:id", async (request, reply) => {
    const { id } = request.params;
  
    let turtle = await Turtles.findOne({ where: { id } });
  
    if (!turtle) {
      reply.code(404).send({ error: "Resource not found" });
      return;
    }
  
    // Удаляем ресурс из массива
    await Turtles.destroy({ where: { id } });
  
    // Возвращаем сообщение об успешном удалении
    return { message: "Resource deleted successfully" };
  });

fastify.post('/pokemons', async function handler(request, reply) {
    const jane = await Pokemon.create({
        name: 'Snorlax',
        url: 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/143.png'
    });

    reply.send(jane);
})

fastify.get('/healthcheck', async function handler(request, reply) {
    reply.send({ msg: 'Server was started successfully, and it\'s good' })
})

try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' })

    fastify.log.info('')
} catch (err) {
    fastify.log.error(err)
    process.exit(1)
}