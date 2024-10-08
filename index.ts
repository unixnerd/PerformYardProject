import fastify from "fastify";

// Possible Improvments: ADD A LINTER
// Possible Improvments: ADD UNIT TESTS

// Import Custom Files/Functions
import searchInput from "./search_input"; // Import the searchInput function
import addArtistToGenre from "./addArtistToGenre"; // Import the addArtistToGenre function
import data from "./data/people_artists.json"; // load in data provided by Doug

// Create a fastify server instance
const server = fastify();

// Define the structure of the imported musicians data
interface People {
  Name: string; // Name is expected to be a string
  "Music Genre": string[]; // Music Genre is expected to be an array of strings
  Movies: string[]; // Movies is expected to be an array of strings
  Location: string; // Location is expected to be a string
}

// Interfaces // Type Definitions

// Define the main structure that contains the people array //
interface PeopleData {
  people: People[]; // People mapping with Name, Music Genre, Movies, Location
  artists: { [key: string]: string[] }; // Genre mapping with artists
}

// Define the interface for the expected [search] query parameters
interface SearchQueryParams {
  word: string; // Word is expected to be a string
}

// Define the interface for the expected [add artist] query parameters
interface AddArtistQueryParams {
  artist: string; // Artist is expected to be a string
  genre: string; // Genre is expected to be a string
}

// Define the const that holds the people/artist data
const people_artists_data: PeopleData = data;

//// Fastify Routes ////

// [search] endpoint
server.get("/search", async (request, reply) => {
  const { word } = request.query as SearchQueryParams;

  // Check if the word parameter is valid
  // -- Typeof not necessary so this could be taken out (instructions say to assume word is a string)
  if (!word || typeof word !== "string") {
    // Handle any errors that occur during the search
    console.error(
      `Error during search: User did not provide a valid word [${word} (${typeof word})]`,
    ); // Log the error for debugging
    return reply
      .status(400)
      .send({ error: "Invalid search query. Please provide a valid word." });
  }

  try {
    // Perform the search
    const result = searchInput(word, people_artists_data);

    // Prettify the JSON result before sending it
    const prettyResult = JSON.stringify(result, null, 2); // 2 spaces for indentation

    if (result.length > 0) {
      // Set the response type to JSON and return the prettified response
      reply.header("Content-Type", "application/json").send(prettyResult);
    } else {
      // No results found - Return no results message to user
      reply
        .header("Content-Type", "application/json")
        .send(JSON.stringify({ error: "No results found." }));
    }
  } catch (error) {
    // Handle any errors that occur during the search
    console.error("Error during search:", error); // Log the error for debugging
    return reply.status(500).send({
      error: "An internal server error occurred. Please try again later.",
    });
  }
});

// [add artist] endpoint
server.post("/addMusicArtist", async (request, reply) => {
  const { artist, genre } = request.query as AddArtistQueryParams;

  // Check if both artist and genre are provided
  if (artist && genre) {
    try {
      // Attempt to add the artist to the specified genre
      let add_artist_to_genre_response = addArtistToGenre(
        artist,
        genre,
        people_artists_data,
      );
      console.log(`Artist ${artist} successfully added to genre ${genre}.`);

      // Send a response - 200 OK (success)
      // Possible that the artist already exiists in the genre
      reply.status(200).send({ message: add_artist_to_genre_response });
    } catch (error) {
      console.error(
        `Error adding artist [${artist}] to genre [${genre}]:`,
        error,
      ); // Log the error for debugging
      reply.status(500).send({
        error: "Internal Server Error",
        message: `Failed to add artist [${artist}].`,
      });
    }
  } else {
    // Log the missing parameters
    console.warn("Artist or genre not provided in the request query.");

    // Send a bad request response
    reply.status(400).send({
      error: "Bad Request",
      message: "Artist and genre are required.",
    });
  }
});

//// Fastify Server ////

// Start the Fastify Server and set Port (Defaulting to localhost)
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  // Adding some StarWars ASCII Art :) 
  console.log(`
                .______    _______ .______       _______   ______   .______      .___  ___. ____    ____  ___      .______       _______  
                |   _  \\  |   ____||   _  \\     |   ____| /  __  \\  |   _  \\     |   \\/   | \\   \\  /   / /   \\     |   _  \\     |       \\ 
                |  |_)  | |  |__   |  |_)  |    |  |__   |  |  |  | |  |_)  |    |  \\  /  |  \\   \\/   / /  ^  \\    |  |_)  |    |  .--.  |
                |   ___/  |   __|  |      /     |   __|  |  |  |  | |      /     |  |\\/|  |   \\_    _/ /  /_\\  \\   |      /     |  |  |  |
                |  |      |  |____ |  |\\  \\----.|  |     |  \`--'  | |  |\\  \\----.|  |  |  |     |  |  /  _____  \\  |  |\\  \\----.|  '--'  |
                | _|      |_______|| _| \`._____||__|      \\______/  | _| \`._____||__|  |__|     |__| /__/     \\__\\ | _| \`._____||_______/ 
  `);

  console.log(`Server listening at ${address}`);
});
