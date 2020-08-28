<template>
    <div class="background">
        <section class="content" role="main">
            <h1>Getting Started</h1>
            <h2>
                Since Moodify utilises the Spotify API, some initial setup is
                required to get it up and running.
            </h2>
            <br>
            <ol>
                <li>
                    Create a Spotify developer account
                    <a href="https://developer.spotify.com/"><u>here</u></a>
                </li>
                <li>
                    Navigate to your developer dashboard and create a new
                    project. The project name and details don't matter. Take
                    note of the <b>Client ID</b> and <b>Client Secret</b>.
                </li>
                <li>
                    Edit your project settings and add
                    "http://localhost:5000/api/request_token/callback" as a
                    white-listed redirect URL
                </li>
                <li>
                    Create a file called "authentication.json" inside /server
                    with the following contents:
                    <br />
                    <code
                        >{ "client_id": "insert_client_id_here",
                        "client_secret": "insert_client_secret_here" }</code
                    >
                </li>
                <li>
                    Run the server and request an access token from the Spotify
                    API by visiting 'http://localhost:5000/api/request_token'.
                    This should initialise the Spotify access tokens and only
                    needs to be done once.
                </li>
            </ol>
        </section>
    </div>
</template>

<style lang="scss" scoped>
@import "../style/_variables.scss";

.background {
    // background-image: linear-gradient(to right, #56ab2f, #95cc3e),
    //     linear-gradient(to bottom, #8fca2f, #608e15);
    // background-blend-mode: lighten;
    background-image: url("../assets/background.png");
    background-size: cover;
    height: 100vh;
}

.content {
    padding: 10vw 5vw 0 5vw;
    text-align: left;
    font-size: 1.2vw;

    h1 {
      font-family: $secondaryFont;
      font-weight: bold;
    }

    h2 {
        font-size: 1.3vw;
    }

    ol {
        padding-left: 1rem;
    }

    a {
        text-decoration: none;
        color: white;
        transition: ease-in-out 0.2s;
    }

    a:hover {
        color: rgb(206, 206, 206);
    }

    code {
        // display: block;
        // margin-top: 1rem;

        display: block;
        color: black;
        margin-top: 10px;
        width: fit-content;
        background-color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 5px;
        margin: 0px;
    }
}

@media only screen and (max-width: $breakpointTablet) {
    .content {

        h1 {
            margin-top: 5vh;
            font-size: 4vw;
        }

        p {
            font-size: 2.5vw;
        }

        li {
            font-size: 2.3vw;
        }

    }
}

@media only screen and (max-width: $breakpointPhone) {
    .content {

        h1 {
            margin-top: 7vh;
            font-size: 7vw;
        }

        p {
            font-size: 4vw;
        }

        li {
            font-size: 3vw;
        }

    }

}
</style>

<script>
export default {
    name: 'Setup'
};
</script>
