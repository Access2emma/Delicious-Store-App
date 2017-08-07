function autoComplete(input, LngInput, LatInput){
	if(!input)
		return;

	const dropdown = new google.maps.places.AutoComplete(input);

	dropdown.addEventListener('place_changed', ()=>{
		const place = dropdown.getPlace();

		LngInput.value = place.geometry.location.lng();
		LatInput.value = place.geometry.location.lat();
	});

	input.on('keydown', (e) => {
		if(e.keyCode === 13){
			e.preventDefault();
		}
	});
}

export default autoComplete;