import dotenv from "dotenv";
dotenv.config();
import axios from "axios";

export const getInstagramFeed = async (req, res) => {
  try {
    const response = await axios.get(`https://graph.instagram.com/${process.env.INSTA_USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&access_token=${process.env.INSTA_ACCESS_TOKEN}`);
    return res.status(200).send({success: true, data: response.data.data})
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
