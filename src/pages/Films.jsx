import React, { useState, useEffect } from "react";
import FilmDetailsModal from "../components/FilmDetailsModal";
import RentFilmModal from "../components/RentFilmModal";

export default function Films() {
    const [films, setFilms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedFilmId, setSelectedFilmId] = useState(null);
    const [rentingFilm, setRentingFilm] = useState(null);

    //Fetch films from backend, with optional search query
    //async and await prevent the screen from freezing while waiting for the response
    const fetchFilms = async (query = "") => {
        setLoading(true);
        try {
            // Goes to /api/films?search= and then whatever the search was
            const url = query
                ? `/api/films?search=${encodeURIComponent(query)}`
                : '/api/films';

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            setFilms(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load which gets first 50 films
    useEffect(() => {
        fetchFilms();
    }, []);

    // Handle search form submit
    const handleSearch = (e) => {
        e.preventDefault(); // Prevent page reload
        fetchFilms(searchTerm);
    };

    const handleRentClick = async (filmId, filmTitle) => {
        // Asks clerk for customer ID
        const customerId = prompt(`Enter Customer ID to rent "${filmTitle}":`);

        // In case user pressed cancel or left it blank
        if (!customerId) return;

        // Sends request to backend
        try {
            const response = await fetch('/api/rent-film', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    film_id: filmId,
                    customer_id: customerId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Rental failed:", error);
            alert("Failed to connect to server.");
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Film Library</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4 d-flex gap-2">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search for a film..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-danger">Search</button>
            </form>

            {searchTerm !== "" &&
                <div className="text-center">
                    <p>Showing top results for "<strong>{searchTerm}</strong>"</p>
                </div>
            }

            {/* Results Table */}
            {loading ? (
                <p>Loading films...</p>
            ) : (
                <table className="table table-striped table-hover" style={{cursor: 'pointer'}}>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Release Year</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>

                    {/* loop through films and create a table row from every element */}
                    {films.map((film) => (
                        <tr
                            //show film details when clicking anywhere on the row, except the rent button
                            key={film.film_id}
                            onClick = {() => setSelectedFilmId(film.film_id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <td>{film.title}</td>
                            <td>
                                <span className="badge bg-secondary">{film.category}</span> {/* Added this badge */}
                            </td>
                            <td>{film.release_year}</td>
                            <td>{film.rating}</td>
                            <td>

                                {/* rent botton */}
                                <button
                                    className="btn btn-sm btn-danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRentingFilm({ id: film.film_id, title: film.title });
                                    }}
                                >
                                    Rent
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/*Reused film detail modal*/}
            {selectedFilmId && (
                <FilmDetailsModal
                    filmId={selectedFilmId}
                    onClose={() => setSelectedFilmId(null)}
                />
            )}

            {/* Rent Film Modal */}
            {rentingFilm && (
                <RentFilmModal
                    filmId={rentingFilm.id}
                    filmTitle={rentingFilm.title}
                    onClose={() => setRentingFilm(null)}
                    onSuccess={() => {
                        fetchFilms();
                    }}
                />
            )}
        </div>
    );
}
