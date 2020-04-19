<template>
    <div class="navbar">
        <div class="left">
            <img src="moodify.svg" class="logo" />
        </div>

        <div class="right">
            <ul>
                <router-link to="/">Home</router-link>
                <router-link to="/getting-started">Setup</router-link>
                <router-link to="/tracker">Tracker</router-link>
            </ul>
        </div>
    </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Montserrat:400,700|Raleway&display=swap");
$primaryFont: Raleway, sans-serif;
$secondaryFont: Montserrat, sans-serif;

.navbar {
    position: absolute;
    width: 100%;
    padding: 2vw 3vw 0 3vw;
    display: grid;
    grid-template-columns: 1fr 2fr;
    justify-items: center;
    font-family: $primaryFont;

    > .left {
        margin: auto;
        width: 100%;
        text-align: left;
        height: 100%;

        > .logo {
            margin: auto;
            height: 90px;
        }
    }

    > .right {
        margin: auto;
        width: 100%;
        text-align: right;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;

        > a {
            font-family: $primaryFont;
            display: inline;
            text-align: right;
            margin-left: 2vw;
            text-decoration: none;
            color: white;
        }

        a.router-link-exact-active {
            font-weight: bold;
        }
    }
}
</style>

<script>
export default {
    name: "Navbar"
};
</script>
