import app from './app';
import 'dotenv/config';

// Resgatando as variáveis de env
const port = process.env.API_PORT;

app.listen(port, () => {
  console.log(`Server rodando na porta ${port}...`);
});
