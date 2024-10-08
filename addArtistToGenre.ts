import fs from "fs"; // Import the fs module

// Define the structure of the imported musicians data
interface People {
  Name: string; // Name is expected to be a string
  "Music Genre": string[]; // Music Genre is expected to be an array of strings
  Movies: string[]; // Movies is expected to be an array of strings
  Location: string; // Location is expected to be a string
}

// Define the main structure that contains the people array
interface PeopleData {
  people: People[]; // People mapping with Name, Music Genre, Movies, Location
  artists: { [key: string]: string[] }; // Genre mapping with artists
}

export default function addArtistToGenre(artist: string, genre: string, people_artists_data: PeopleData) {
  // Add the artist to the genre if it exists
  if (people_artists_data.artists[genre]) {
    // Check if the artist already exists in the genre
    if (people_artists_data.artists[genre].includes(artist)) {
      console.error(`Artist is already ${genre}.`); // Log the error for debugging
      return "Artist is already in the genre.";
    } else {
      people_artists_data.artists[genre].push(artist);
    }
  } else {
    console.error(`Genre ${genre} does not exist.`); // Log the error for debugging
    return `Genre ${genre} does not exist.`;
  }

  // Write musicians to file
  try {
    fs.writeFileSync(
      "./data/people_artists.json",
      JSON.stringify(people_artists_data, null, 2),
      "utf8",
    ); // Format JSON with 2 spaces for readability
    console.log("Artist added and file updated successfully.");
    return `Artist [${artist}] added to genre [${genre}].`;
  } catch (error) {
    console.error("Error writing to file:", error); // Log the error for debugging
    return `Error when writing artist to genre.`;
  }
}