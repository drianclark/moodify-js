<template>
    <div class="background">
        <div class="title-section">
            <div class="spacer"></div>

            <div class="title">
                <div class="title-image">
                    <img src="../assets/moodify.svg" alt="Moodify title logo" />
                </div>
                <p>Mood through music</p>
            </div>

            <div class="title-interactive">
                <p>How does it work?</p>
                <a href="#how-it-works">
                    <img
                        src="../assets/down_arrow_circle.svg"
                        alt="arrow down button"
                    />
                </a>
            </div>
        </div>

        <div id="how-it-works" class="how-it-works" role="main">
            <div class="flex-container">
                <div class="illustration">
                    <img src="../assets/music.svg" alt="musical note" />
                    <img src="../assets/right_arrow.svg" alt="right arrow" />
                    <img src="../assets/data.svg" alt="graph icon" />
                </div>
                <p>
                    By tracking your Spotify listening history, Moodify can
                    infer and help you visualize changes in your mood, helping
                    you learn more about yourself- and maybe even make changes
                    to your lifestyle!
                </p>
            </div>
        </div>
    </div>
</template>

<script>
const isInViewport = function(elem) {
    let bounding = elem.getBoundingClientRect();
    return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <=
            (window.innerWidth || document.documentElement.clientWidth)
    );
};

const scrollListener = function() {
    let animation = document.getElementsByClassName('illustration')[0];

    if (isInViewport(animation)) {
        let images = animation.getElementsByTagName('img');
        console.log(images);

        images.forEach((image) => {
            image.style.animationPlayState = 'running';
        });
    }
};

export default {
    name: 'home',
    mounted: function() {
        window.addEventListener('scroll', scrollListener, false);
    },
    destroyed: function() {
        window.removeEventListener('scroll', scrollListener);
    },
};
</script>

<style lang="scss" scoped>
@import '../style/_variables.scss';

.background {
    // background-image: url("../assets/blobs.png"), linear-gradient(to right, #56ab2f, #95cc3e),
    // linear-gradient(to bottom, #8fca2f, #608e15);
    // background-blend-mode: lighten;
    // background-size: cover, auto, auto;
    background-image: url('../assets/background.png');
    background-size: cover;
    height: 200vh;
}

.title-section {
    height: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .spacer {
        flex-grow: 1;
    }

    .title {
        flex-grow: 9;
        display: flex;
        flex-direction: column;
        justify-content: center;

        > .title-image {
            width: 100%;

            > img {
                width: 25vw;
            }
        }

        > h1 {
            font-family: $secondaryFont;
            font-size: 5vw;
            font-weight: 700;
            text-shadow: 0.1rem 0.1rem 2px rgba(0, 0, 0, 0.25);
            margin-bottom: 0;
        }

        > p {
            font-size: 2vw;
        }
    }

    .title-interactive {
        flex-grow: 3;
        font-family: $secondaryFont;
        font-size: 1.4vw;

        > p {
            margin-bottom: 0;
        }

        > a {
            background-size: 1vh;
            filter: invert(1);
            transition: ease-out 0.5s;

            > img {
                width: 2vw;
                transition: ease-out 0.5s;
            }

            > img:hover {
                filter: invert(1) opacity(0.4);
                transform: translateY(0.2em);
            }
        }
    }
}

.how-it-works {
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;

    > .flex-container {
        padding: 0 20vw;
        text-align: left;

        > .illustration {
            display: flex;
            justify-content: center;
            margin-bottom: 10vh;

            > img {
                width: 4vw;
                filter: invert(1);
                stroke-width: 50px;
                opacity: 0;
            }

            @keyframes dash-fadeIn {
                from {
                    opacity: 0;
                    transform: translateX(-4vw);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            > img:nth-of-type(1) {
                animation: dash-fadeIn 1s ease-out forwards paused;
            }

            > img:nth-of-type(2) {
                width: 2vw;
                margin: 0 2vw;
                animation: dash-fadeIn 1s ease-out forwards paused;
                animation-delay: 1.5s;
            }

            > img:nth-of-type(3) {
                animation: dash-fadeIn 1s ease-out forwards paused;
                animation-delay: 3s;
            }
        }

        > p {
            font-size: 1.6vw;
        }
    }
}

@media only screen and (max-width: $breakpointTablet) {
    .title-section {
        > .title {
            > .p {
                font-size: 2vw;
            }
        }
    }

    .title-section > .title-interactive {
        font-size: 2vw;
    }

    .how-it-works {
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;

    > .flex-container {
        padding: 0 20vw;
        text-align: left;

        > .illustration {
            img {
                width: 10vw;
            }

            > img:nth-of-type(2) {
                width: 6vw;
            }
        }

        > p {
            font-size: 2.4vw;
        }
    }
}
}

@media only screen and (max-width: $breakpointPhone) {
    .background {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .title-section {
        flex-basis: 40%;
        margin-top: 15vh;

        > .title {
            h1 {
                font-size: 10vw;
            }

            p {
                font-size: 5vw;
            }
        }
    }

    .title-interactive {
        display: none;
    }

    .how-it-works {
        display: block;
        flex-basis: 60%;

        > .flex-container {
            > .illustration {
                display: none;
            }

            > p {
                font-size: 3vw;
                text-align: center;
            }
        }
    }
}
</style>
