<template>
    <div class="navbar">
        <div class="left">
            <p>Moodify</p>
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
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,700|Raleway&display=swap');
@import "../assets/style/_variables.scss";

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

        > p {
            margin: auto;
            font-family: $secondaryFont;
            font-weight: bold;
            font-size: 2vw;
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


@media only screen and (max-width: $breakpointTablet) {
    .navbar {
        padding: 3vw 4vw 0 4vw;
    }

    .navbar ul > a, .navbar > .left > p {
        font-size: 2.4vw;
    }

}

@media only screen and (max-width: $breakpointPhone) {

    .navbar ul > a, .navbar > .left > p {
        font-size: 3.2vw;
    }

    .navbar ul > a {
        margin-left: 4vw;
    }
}
</style>

<script>
export default {
    name: 'Navbar'
};
</script>
