<template>
    <div id="app">
        <Navbar></Navbar>

        <router-view />
    </div>
</template>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Montserrat:400,700|Raleway&display=swap");
$primaryFont: Raleway, sans-serif;
$secondaryFont: Montserrat, sans-serif;

html {
    scroll-behavior: smooth;
}

body::-webkit-scrollbar {
    width: 0.3em;
}

body::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: white;
}
body::-webkit-scrollbar-thumb {
    background-color: rgb(64, 143, 28);
}

body {
    margin: 0 !important;
}

#app {
    font-family: $primaryFont;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: white;
}

#nav {
    padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #42b983;
}
</style>

<script>
import Navbar from "./components/Navbar";

document.title = "Moodify";

export default {
    components: {
        Navbar
    }
};
</script>
