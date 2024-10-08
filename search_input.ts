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

// Define the type for search_point_mappings
const search_point_mappings: { [key: string]: number } = {
  name: 4, // A name match is worth 4 points
  genre: 1, // A music genre match is worth 1 point
  movie: 1, // A movie match is worth 1 point
  location: 1, // A location match is worth 1 point
  artist: 2, // A musical artist match is worth 2 points.
};

// Define the function to calculate the search score/matching category(s)
export default function searchInput(input: string, people_artists_data: PeopleData) {
  let results: { name: string; count: number; matches: string[] }[] = []; // Initialize Results Array
  const lowerInput = input.toLowerCase(); // Store the lowercased input

  // Loop through each entry in the data
  for (const person of people_artists_data.people) {
    let matchList: string[] = []; // Initialize Match List
    let matchTotal = 0; // Initialize Match Total

    // Check for Name and Location in a single function
    const checkField = (field: string, point: number, matchKey: string) => {
      if (field.toLowerCase().includes(lowerInput)) {
        matchTotal += point;
        matchList.push(matchKey);
      }
    };

    checkField(person["Name"], search_point_mappings.name, "name");
    checkField(person["Location"], search_point_mappings.location, "location");

    // Check for movies in a single pass
    // Could also use the some method but ill stick with a simple for loop for now
    for (const movie of person["Movies"]) {
      // If a movie was already matched, dont look anymore
      if (movie.toLowerCase().includes(lowerInput)) {
        matchTotal += search_point_mappings.movie;
        matchList.push("movies");
        break; // Break out of the loop if a match is found
      }
    }


    // Check if the person's music genre(s) have an artist that matches the input
    for (const genre of person["Music Genre"]) {
      // Check if the input is a substring of the genre
      // If a genre was already matched, dont look anymore
      if (genre.toLowerCase().includes(lowerInput)){
        if (!matchList.includes("genre")){
          matchTotal += search_point_mappings.genre;
          matchList.push("genre");
        }
      }
      const artists = people_artists_data.artists[genre] || [];
      // Check if the input match any of the person's artists as a substring
      for (const artist of artists) {
        if (artist.toLowerCase().includes(lowerInput)) {
          if (!matchList.includes("artist")){
            matchTotal += search_point_mappings.artist;
            matchList.push("artist");
          }
          break; // Break out of the inner loop if a match is found
        }
      }
    }

    // Validate there is atleast 1 match and add it to the results
    if (matchTotal > 0) {
      let matching_data: { name: string; count: number; matches: string[] } = {
        name: person.Name,
        count: matchTotal,
        matches: matchList,
      };

      // Add the object to the results array
      results.push(matching_data);
    }
  }

  // Sorts in descending order (highest count first)
  if (results) {
    results.sort((a, b) => b.count - a.count);
    console.log(results, "\n");
    return results;
  }

  // If no results are found, return an empty array
  return [];
}