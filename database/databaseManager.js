const {getTrackData} = require("@hydralerne/youtube-api");
const {supabase} = require("../config/database");


async function addSong(id,url) {
    if (!id || typeof id !== 'string' || !id.trim()) {
        console.error('Invalid song ID:', id);
        return;
    }
    let data = await getTrackData(id);
    if (!data) {
        console.error('Failed to fetch track data for ID:', id);
        return;
    }
    console.log('Fetched track data:', data);
    let title = data.title;
    let artist = data.artist;
    let duration = data.duration; // Duration in seconds
    let smallThumbnail = data.poster;
    let largeThumbnail = data.posterLarge;

    if(!smallThumbnail){
        smallThumbnail = '';
    }

    if(!largeThumbnail){
        largeThumbnail = '';
    }

    if (duration === 0 || !duration) {
        duration = 0; // Set the duration to 0 if not available
    }
    const song = {
        id: id,
        title: title,
        artist: artist,
        duration: duration,
        smallThumbnail: smallThumbnail,
        largeThumbnail: largeThumbnail,
        url: url
    };
    console.log('Adding song to database:', song);
    try {
        supabase
            .from('songs')
            .insert(song)
            .then(({ data, error }) => {
                if (!error) {
                    console.log('Song added successfully:', data);
                }
                else {
                    console.error('Error adding song:', error);
                }
            })
    } catch (err) {
        console.error('Database operation failed:', err);
    }
}

async function getSong(id) {
    if (!id || typeof id !== 'string' || !id.trim()) {
        console.error('Invalid song ID:', id);
        return null;
    }
    try {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error fetching song:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('Database operation failed:', err);
        return null;
    }
}

module.exports = { addSongToDatabase:addSong, getSongFromDatabase:getSong };