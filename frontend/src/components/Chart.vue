<template>
  <div class="hello">
      <b-container>
          <track-filter
            v-on:days-filter='updateChartDays'
            v-on:date-filter='updateChartDate'
            >
          </track-filter>
          <canvas id="chart"></canvas>
      </b-container>
  </div>
</template>

<script>
import axios from 'axios';
import Chart from 'chart.js';
import TrackFilter from './TrackFilter.vue'
export default {
  name: 'ChartComponent',
  components: { TrackFilter },
  methods: {
      updateChartDays: function(numberOfDays) {
          axios.get('http://localhost:5000/api/get_tracks', {
              params: {
                  days: numberOfDays
              }
          })
            .then(response => {
                console.log(response.data)
            })
      },
      updateChartDate: function(startDate, endDate) {
          axios.get('http://localhost:5000/api/get_tracks', {
              params: {
                  startDate: startDate,
                  endDate: endDate
              }
          })
            .then(response => {
                console.log(response.data)
                console.log(startDate)
                console.log(endDate)
            })
      }
  }
}

var accessToken;
getAccessToken();

function getAccessToken() {
    axios.get("http://localhost:5000/api/get_token")
        .then(token => {
            accessToken = token.data
            return token.data
        })
}
//
function getTrackInfo(spotifyid) {
    // interceptor for handling authentication errors

    var refresh_interceptor = axios.interceptors.response.use(null, (error) => {
          if (error.config && error.response && error.response.status === 401) {
            return axios.get("http://localhost:5000/api/get_token").then((token) => {
              error.config.headers.Authorization = "Bearer " + token.data
              // console.log(error.config)
              return axios.request(error.config);
            });
          }

          return Promise.reject(error);
        });

    return axios.get("https://api.spotify.com/v1/tracks/" + spotifyid,
                { headers: {'Authorization':'Bearer ' + accessToken}})

}

var customTooltips = function(tooltip) {
	// Tooltip Element
	var tooltipEl = document.getElementById('chartjs-tooltip');

	if (!tooltipEl) {
		tooltipEl = document.createElement('div');
		tooltipEl.id = 'chartjs-tooltip';
		tooltipEl.innerHTML = '<div></div>';
		this._chart.canvas.parentNode.appendChild(tooltipEl);
	}

	// Hide if no tooltip
	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = 0;
		return;
	}

	// Set caret Position
	tooltipEl.classList.remove('above', 'below', 'no-transform');
	if (tooltip.yAlign) {
		tooltipEl.classList.add(tooltip.yAlign);
	} else {
		tooltipEl.classList.add('no-transform');
	}

	// Set Text
	if (tooltip.body) {
        var innerHtml;
		var titleLines = tooltip.title || [];
		let spotifyid = tooltip.body[0].lines[0];
        console.log(spotifyid)
        let trackInfo =
            getTrackInfo(spotifyid)
                .then(response => {
                    let artists = []

                    let title = response.data.name;
                    let imgUrl = response.data.album.images[1].url
                    for (let artist of response.data.artists) {
                        artists.push(artist.name)
                    }

                    innerHtml = '<h3 class="track-title mb-0">' + title + '</h2>';
                    innerHtml += '<h5 class="artists mb-3">' + artists.join(', ') + '</h5>'
                    innerHtml += '<img src= ' + imgUrl + '>'

    				var tableRoot = tooltipEl.querySelector('div');
    				tableRoot.innerHTML = innerHtml;

                    return "trackInfo";
                })
	}

	var positionY = this._chart.canvas.offsetTop;
	var positionX = this._chart.canvas.offsetLeft;

	// Display, position, and set styles for font
	tooltipEl.style.opacity = 1;
	tooltipEl.style.left = positionX + tooltip.caretX + 'px';
	tooltipEl.style.top = positionY + tooltip.caretY + 'px';
	tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
	tooltipEl.style.fontSize = tooltip.bodyFontSize + 'px';
	tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
};

function draw_graph() {
    axios.get("http://localhost:5000/api/get_tracks")
        .then(function (response) {
            let data = []
            let index = 0
            for (let track of response.data) {
                data.push({x:index, y:track.valence})
                index +=1;
            }

            console.log(data)

            var ctx = document.getElementById('chart').getContext('2d');
            var myLineChart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        data: data,
                        fill: false,
                        showLine: true,
                        lineTension: 0,
                        borderColor: 'rgba(0, 128, 255, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false,
						mode: 'index',
						position: 'nearest',
						custom: customTooltips,
                        callbacks: {
                            label: function(tooltipItem, data) {
                                var spotifyid = response.data[tooltipItem.index].spotifyid;
                                console.log(tooltipItem.index);

                                return spotifyid;
                            }
                        }
                    }
                }
            });

            return data;
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}

window.onload = function() {
    draw_graph()
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import url('https://fonts.googleapis.com/css?family=Yantramanav&display=swap');

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.container >>> #chartjs-tooltip {
    opacity: 1;
    position: absolute;
    background: rgba(0, 0, 0, .7);
    color: white;
    padding: 10px;
    border-radius: 3px;
    -webkit-transition: all .1s ease;
    transition: all .1s ease;
    pointer-events: none;
    -webkit-transform: translate(-50%, 0);
    transform: translate(-50%, 0);
}

.container >>> .track-title {
	font-family: 'Yantramanav', sans-serif;
	font-size: 22px;
    text-align: left;
}

.container >>> .artists {
    font-family: 'Yantramanav', sans-serif;
    text-align: left;
    font-size: 16px;
}
</style>
