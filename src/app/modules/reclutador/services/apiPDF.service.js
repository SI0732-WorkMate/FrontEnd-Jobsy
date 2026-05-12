import axios from "axios";

const API_URL = "https://api.pdf.co/v1/pdf/convert/to/text";
const API_KEY = "org.29ron@gmail.com_onyU3ZIWoBxy4PiFsp7jjTBOyky9ZH3NWvxCHi5RYJGp0WTUhETyelGuzsGUjna3";

export const getTextPDF = async (urlPDF) =>{
    try{
        const response = await axios.post(API_URL, {
            url: urlPDF,
            inline: true,
            unwrap: true,
            ocrMode: "Auto",
            pages: ""
        }, {
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data.body;
    }catch(err){
        console.log(err);
    }
}