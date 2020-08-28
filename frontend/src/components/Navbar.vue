<template>
    <div class="navbar" role="navigation">
        <div class="left">
            <router-link to="/">Moodify</router-link>
            
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
@import "../style/_variables.scss";


.navbar {
    position: absolute;
    width: 100%;
    padding: 2vw 3vw 0 3vw;
    display: grid;
    grid-template-columns: 1fr 2fr;
    justify-items: center;
    align-items: bottom;
    font-family: $primaryFont;

    > .left {
        margin: auto;
        width: 100%;
        text-align: left;
        height: 100%;

        a {
            text-decoration: none;
            color: white;
            margin: auto;
            font-family: $secondaryFont;
            font-weight: bold;
            font-size: 2vw;

            &:hover {
                text-decoration: none;
            }
        }
    }

    > .right {
        margin: auto;
        width: 100%;
        text-align: right;
        font-size: 1.4vw;
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

@media only screen and (max-width: $breakpointTablet){
    .navbar {
        padding: 11px 16px 0 16px;

        > .left {
            > a {
                font-size: 16px;
            }
        }

        > .right {
            font-size: 14px;

            > ul > a {
                margin-left: 22px;
            }
        }
    }
}

</style>

<script>
export default {
    name: "Navbar"
};
</script>
