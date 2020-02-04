<template>
    <b-container class="text-center">
        <div class='mb-5'>
            <h3>
              This page allows you to authorise this web application to access your Spotify listening history
            </h3>
        </div>

        <div>
          <b-button v-on:click='initAuth'> 
            Initialise authorization
          </b-button>
        </div>
    </b-container>
</template>


<script>
import axios from 'axios';

export default {
    name: 'Auth',
    methods: {
      initAuth: function() {
        axios.get('https://accounts.spotify.com/authorize', 
          { params: {
            'client_id':'44ef850b66114e6ea1d2fd3c9124af70', 
            'response_type':'code', 
			'redirect_uri': 'http://localhost:8080/auth/callback', 
			// CHANGE ABOVE IN PRODUCTION
            'scope':'user-read-recently-played'
            }
		}).then(response => {
			console.log(response);
		})
      }
    }
}
</script>

<style scoped>

</style>
