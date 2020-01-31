import File from '../models/File';

class FileController {
  async store(req, res) {
    const { filename: path, originalname: name } = req.file;

    const { url } = await File.create({ name, path });

    return res.json({ url, name });
  }
}

export default new FileController();
