const fs = require('fs');
const {supabaseAdmin, bucketName} = require('../config/database');

async function uploadFileToSupabase(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = filePath.split('\\').pop(); // Extract the file name from the path
        if (typeof fileName !== 'string' || !fileName.trim()) {
            console.error('File name could not be extracted from the path:', filePath);
            return null;
        }
        console.log('Uploading file to Supabase:', fileName);
        const {data, error} = await supabaseAdmin.storage
            .from(bucketName)
            .upload(fileName, fileBuffer, {
                contentType: 'audio/mpeg',
                metadata: {},
                upsert: true // Replace if file already exist
            });
        if (error) {
            console.error('Error uploading file to Supabase:', error.message);
            return null;
        }
        console.log('File uploaded successfully:', data);
        const {data: {publicUrl}} = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(fileName);
        console.log(publicUrl)
        return publicUrl;
    } catch (error) {
        console.error('Error reading file or uploading to Supabase:', error.message);
        return null;
    }
}

module.exports = {uploadFileToSupabase}