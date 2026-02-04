// src/App.tsx

import { useState, useEffect } from "react";
import "./App.css";

function App() {
	const [searchQuery, setSearchQuery] = useState("");
	const [pokemon, setPokemon] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [playingSound, setPlayingSound] = useState(false);

	useEffect(() => {
		if (searchQuery.trim().length < 1) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		const fetchSuggestions = async () => {
			try {
				const response = await fetch(
					`https://pokeapi.co/api/v2/pokemon?limit=1000`
				);
				const data = await response.json();
				const filtered = data.results
					.map((p: any) => p.name)
					.filter((name: string) =>
						name.toLowerCase().startsWith(searchQuery.toLowerCase())
					)
					.slice(0, 8);
				setSuggestions(filtered);
				setShowSuggestions(filtered.length > 0);
			} catch (err) {
				setSuggestions([]);
			}
		};

		fetchSuggestions();
	}, [searchQuery]);

	const handleSuggestionClick = async (suggestion: string) => {
		setSearchQuery(suggestion);
		setShowSuggestions(false);

		setLoading(true);
		setError("");
		setPokemon(null);

		try {
			const response = await fetch(
				`https://pokeapi.co/api/v2/pokemon/${suggestion.toLowerCase()}`
			);
			if (!response.ok) {
				throw new Error("Pokemon not found");
			}
			const data = await response.json();
			setPokemon(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch Pokemon");
			setPokemon(null);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) {
			setError("Please enter a Pokemon name");
			return;
		}

		setLoading(true);
		setError("");
		setPokemon(null);

		try {
			const response = await fetch(
				`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase()}`
			);
			if (!response.ok) {
				throw new Error("Pokemon not found");
			}
			const data = await response.json();
			setPokemon(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch Pokemon");
			setPokemon(null);
		} finally {
			setLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const playSound = async () => {
		if (!pokemon?.cries?.latest) {
			console.warn("Sound not available for this Pokemon");
			return;
		}

		setPlayingSound(true);
		try {
			const audio = new Audio(pokemon.cries.latest);
			audio.play();
			audio.onended = () => setPlayingSound(false);
		} catch (err) {
			console.error("Failed to play sound:", err);
			setPlayingSound(false);
		}
	};

	return (
		<div className="container">
			<h1>Pokemon Search</h1>

			<div className="search-section">
				<div className="search-input-wrapper">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						onKeyPress={handleKeyPress}
						onFocus={() => setShowSuggestions(suggestions.length > 0)}
						onBlur={() => setShowSuggestions(false)}
						placeholder="Enter Pokemon name..."
						disabled={loading}
					/>
					{showSuggestions && suggestions.length > 0 && (
						<ul className="suggestions-dropdown">
							{suggestions.map((suggestion) => (
								<li key={suggestion}>
									<button
										type="button"
										onMouseDown={(e) => {
											e.preventDefault();
											handleSuggestionClick(suggestion);
										}}
										className="suggestion-item"
									>
										{suggestion.charAt(0).toUpperCase() +
											suggestion.slice(1)}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
				<button onClick={handleSearch} disabled={loading}>
					{loading ? "Searching..." : "Search"}
				</button>
			</div>

			{error && <p className="error">{error}</p>}

			{pokemon && (
				<div className="pokemon-result">
					<h2>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
					{pokemon.sprites?.front_default && (
						<img src={pokemon.sprites.front_default} alt={pokemon.name} />
					)}
					{pokemon.cries?.latest && (
						<button
							onClick={playSound}
							disabled={playingSound}
							className="sound-button"
							title="Play Pokemon cry"
						>
							{playingSound ? "🔊 Playing..." : "🔊 Play Cry"}
						</button>
					)}
					<p>Height: {pokemon.height / 10}m</p>
					<p>Weight: {pokemon.weight / 10}kg</p>
					<p>Type(s): {pokemon.types.map((t: any) => t.type.name).join(", ")}</p>
				</div>
			)}
		</div>
	);
}

export default App;
