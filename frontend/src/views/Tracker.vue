<template>
    <div class="background">
        <section class="content">
            <b-row>
                <b-col>
                    <h1>Trends</h1>
                </b-col>
                <b-col cols="auto">
                    <b-button
                        :disabled="trackUpdateLoading"
                        class="row mb-5 ml-3"
                        v-on:click="triggerTracksUpdate"
                        variant="outline-primary"
                    >
                        Update DB
                        <b-spinner
                            v-if="trackUpdateLoading"
                            small
                            class="ml-2"
                            type="grow"
                            variant="primary"
                            label="Loading..."
                        ></b-spinner>
                    </b-button>
                </b-col>
            </b-row>

            <TrackFilter
                v-on:days-filter="updateChartDays"
                v-on:date-filter="updateChartDate"
                :format="dateFormatter"
            />

            <scatter-chart
                v-if="loaded"
                :styles="{height: '600px', position: 'relative'}"
                :height="500"
                :options="options"
                :chart-data="chartdata"
            />
        </section>
    </div>
</template>

<style lang="scss" scoped>
$primaryFont: Raleway, sans-serif;
$secondaryFont: Montserrat, sans-serif;

.background {
    background-image: linear-gradient(to right, #56ab2f, #95cc3e),
        linear-gradient(to bottom, #8fca2f, #608e15);
    background-blend-mode: lighten;
    height: 100vh;
    width: 100vw;
}

.content {
    padding: 10vw 5vw 0 5vw;
    text-align: left;

    h1 {
        font-family: $secondaryFont;
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
</style>

<script>
import ScatterChart from "@/components/Graph.vue";
import TrackFilter from "@/components/TrackFilter.vue";
import axios from "axios";
import moment from "moment";

const chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );

var tracksinfo = {};

export default {
    name: "Tracker",
    components: {
        ScatterChart,
        TrackFilter
    },
    methods: {
        updateChartDays: function(numberOfDays) {
            this.loaded = false;

            axios
                .get("/api/get_tracks_by_days", {
                    params: {
                        days: numberOfDays
                    }
                })
                .then(response => {
                    console.log(response);
                    let data = [];
                    let index = 0;
                    let spotifyIDs = [];

                    for (let track of response.data) {
                        data.push({
                            x: moment(track.date).toDate(),
                            y: track.valence
                        });
                        spotifyIDs.push(track.spotifyid);
                        index += 1;
                    }

                    this.updateTracksInfo(spotifyIDs);

                    let data_object = {
                        datasets: [
                            {
                                data: data,
                                fill: false,
                                showLine: true,
                                lineTension: 0,
                                borderColor: "rgba(0, 128, 255, 1)"
                            }
                        ]
                    };

                    this.chartdata = data_object;
                    this.updateTooltips(response);
                    this.configureAxes();

                    this.loaded = true;
                });
        },

        updateChartDate: function(startDate, endDate) {
            this.loaded = false;

            axios
                .get("/api/get_tracks_by_date", {
                    params: {
                        startDate: moment(startDate).format("YYYY-MM-DD"),
                        endDate: moment(endDate).format("YYYY-MM-DD")
                    }
                })
                .then(response => {
                    let data = [];
                    let index = 0;
                    let spotifyIDs = [];

                    for (let track of response.data) {
                        data.push({
                            x: moment(track.date).toDate(),
                            y: track.valence
                        });
                        spotifyIDs.push(track.spotifyid);
                        index += 1;
                    }

                    console.log(response);
                    this.updateTracksInfo(spotifyIDs);

                    let data_object = {
                        datasets: [
                            {
                                data: data,
                                fill: false,
                                showLine: true,
                                lineTension: 0,
                                borderColor: "rgba(0, 128, 255, 1)"
                            }
                        ]
                    };

                    this.chartdata = data_object;
                    this.updateTooltips(response);
                    this.configureAxes();

                    this.loaded = true;
                });
        },

        updateTracksInfo: async function(spotifyIDs) {
            tracksinfo = {};
            for (let idArray of chunk(spotifyIDs, 50)) {
                let response = await getTracksInfo(idArray.join(","));

                for (let trackInfo of response.data.tracks) {
                    let spotifyID = trackInfo.id;
                    let currentInfo = {
                        artists: [],
                        title: trackInfo.name,
                        imgUrl: trackInfo.album.images[1].url
                    };

                    for (let artist of trackInfo.artists) {
                        currentInfo.artists.push(artist.name);
                    }

                    tracksinfo[spotifyID] = currentInfo;
                }
            }
        },

        dateFormatter: function(date) {
            return moment(date).format("DD-MM-YYYY");
        },

        triggerTracksUpdate: function() {
            this.trackUpdateLoading = true;
            axios.get("/api/update_tracks").then(response => {
                console.log(response);
                this.trackUpdateLoading = false;
            });
        },

        updateTooltips: function(response) {
            this.options.tooltips = {
                enabled: false,
                mode: "index",
                position: "nearest",
                custom: customTooltips,
                callbacks: {
                    label: function(tooltipItem, data) {
                        let spotifyid =
                            response.data[tooltipItem.index].spotifyid;
                        return spotifyid;
                    }
                }
            };
        },

        configureAxes: function() {
            this.options.scales = {
                xAxes: [
                    {
                        type: "time",
                        distribution: "series",
                        time: {
                            minUnit: "day"
                        },
                        bounds: "ticks",
                        ticks: {
                            minRotation: 90
                        }
                    }
                ],
                yAxes: [
                    {
                        ticks: {
                            stepSize: 0.5,
                            maxTicksLimit: 3
                        }
                    }
                ]
            };
        }
    },
    data: () => ({
        loaded: false,
        chartdata: null,
        options: null,
        trackUpdateLoading: false
    }),

    async mounted() {
        this.loaded = false;
        try {
            const response = await axios.get("/api/get_tracks_by_days", {
                params: {
                    days: 1
                }
            });

            let data = [];
            let index = 0;
            let spotifyIDs = [];

            for (let track of response.data) {
                data.push({ x: moment(track.date).toDate(), y: track.valence });
                spotifyIDs.push(track.spotifyid);
                index += 1;
            }

            this.updateTracksInfo(spotifyIDs);

            let data_object = {
                datasets: [
                    {
                        data: data,
                        fill: false,
                        showLine: true,
                        lineTension: 0,
                        borderColor: "rgba(0, 128, 255, 1)"
                    }
                ]
            };

            this.chartdata = data_object;
            this.options = {
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            };
            this.updateTooltips(response);
            this.configureAxes();

            console.log(tracksinfo);
            this.loaded = true;
        } catch (e) {
            console.error(e);
        }
    }
};

var accessToken;
getAccessToken();

function getAccessToken() {
    axios.get("/api/get_token").then(token => {
        accessToken = token.data;
        return token.data;
    });
}

function getTracksInfo(spotifyids) {
    // interceptor for handling authentication errors

    var refresh_interceptor = axios.interceptors.response.use(null, error => {
        if (error.config && error.response && error.response.status === 401) {
            return axios.get("/api/get_token").then(token => {
                error.config.headers.Authorization = "Bearer " + token.data;
                return axios.request(error.config);
            });
        }

        return Promise.reject(error);
    });

    return axios.get("https://api.spotify.com/v1/tracks", {
        headers: { Authorization: "Bearer " + accessToken },
        params: { ids: spotifyids }
    });
}

var customTooltips = function(tooltip) {
    // Tooltip Element
    var tooltipEl = document.getElementById("chartjs-tooltip");

    if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.id = "chartjs-tooltip";
        tooltipEl.innerHTML = "<div></div>";
        this._chart.canvas.parentNode.appendChild(tooltipEl);
    }

    // Hide if no tooltip
    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    // Set caret Position
    tooltipEl.classList.remove("above", "below", "no-transform");
    if (tooltip.yAlign) {
        tooltipEl.classList.add(tooltip.yAlign);
    } else {
        tooltipEl.classList.add("no-transform");
    }

    // Set Text
    if (tooltip.body) {
        var innerHtml;
        var titleLines = tooltip.title || [];
        let spotifyid = tooltip.body[0].lines[0];

        let artists = [];
        let title = tracksinfo[spotifyid].title;
        let imgUrl = tracksinfo[spotifyid].imgUrl;
        for (let artist of tracksinfo[spotifyid].artists) {
            artists.push(artist);
        }

        innerHtml = '<h3 class="track-title mb-0">' + title + "</h2>";
        innerHtml += '<h5 class="artists mb-3">' + artists.join(", ") + "</h5>";
        innerHtml += "<img src= " + imgUrl + ">";

        var tableRoot = tooltipEl.querySelector("div");
        tableRoot.innerHTML = innerHtml;
    }

    var positionY = this._chart.canvas.offsetTop;
    var positionX = this._chart.canvas.offsetLeft;

    // Display, position, and set styles for font
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = positionX + tooltip.caretX + "px";
    tooltipEl.style.top = positionY + tooltip.caretY + "px";
    tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
    tooltipEl.style.fontSize = tooltip.bodyFontSize + "px";
    tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
};
</script>
