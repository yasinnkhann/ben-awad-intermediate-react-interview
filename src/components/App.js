import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/App.css';

function App() {
	const [isLoaded, setIsLoaded] = useState(false);
	const [profiles, setProfiles] = useState({});

	const fetchProfiles = async signal => {
		try {
			const { data } = await axios.get(
				'https://randomuser.me/api/?results=20',
				{
					signal,
				}
			);
			console.log(data);
			setProfiles({
				data: data.results,
				sorting: 'UNSORTED',
			});
			setIsLoaded(true);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		const abortController = new AbortController();
		fetchProfiles(abortController.signal);
		return () => abortController.abort();
	}, []);

	if (!isLoaded) {
		return <div>Loading...</div>;
	}

	const getLocationKeys = () => {
		const locationObj = profiles.data.map(profile => profile.location)[0];
		const locationKeysArr = extractDeepestKeys(locationObj);

		return locationKeysArr;
	};

	const extractDeepestKeys = obj => {
		const keysArr = [];
		for (let key in obj) {
			let val = obj[key];
			if (typeof val !== 'object') {
				keysArr.push(key);
			} else {
				keysArr.push(...extractDeepestKeys(val));
			}
		}

		return keysArr;
	};

	const extractDeepestValues = obj => {
		const valuesArr = [];
		for (let key in obj) {
			let val = obj[key];
			if (typeof val !== 'object') {
				valuesArr.push(val);
			} else {
				valuesArr.push(...extractDeepestValues(val));
			}
		}
		return valuesArr;
	};

	const getLocationValues = locationObj => {
		const locationValuesArr = extractDeepestValues(locationObj);
		return locationValuesArr;
	};

	const handleSorting = header => {
		const profilesCopy = [...profiles.data];
		console.log(profilesCopy);
		const sortedProfiles = profilesCopy.sort((a, b) => {
			console.log(a.location[header], b.location[header]);
			if (a.location[header] < b.location[header]) {
				return -1;
			}
			if (a.location[header] > b.location[header]) {
				return 1;
			}
			return 0;
		});
		console.log(sortedProfiles.map(profile => profile.location[header]));
		setProfiles(currProfiles => ({
			...currProfiles,
			data: sortedProfiles,
		}));
	};

	return (
		<div className='app'>
			<table>
				<thead>
					<tr>
						{getLocationKeys().map(header => (
							<th key={header} onClick={() => handleSorting(header)}>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{profiles.data.map(profile => (
						<tr key={profile.login.uuid}>
							{getLocationValues(profile.location).map((val, idx) => (
								<td key={idx}>{val}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default App;
