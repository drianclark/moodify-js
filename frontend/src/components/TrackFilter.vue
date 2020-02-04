<template>
    <b-container class="text-left mb-2">
        <b-row>
            <b-col cols=4>
                <b-form-select v-model="selected" :options="options"></b-form-select>
            </b-col>

            <b-col cols=4 v-if="selected === 'days'">
                <b-form inline>
                    <b-input
                      v-model="numberOfDays"
                      required
                      placeholder="days"
                      class="mr-3"
                      type="number"
                      min=1
                    ></b-input>
                    <b-button variant="primary" v-on:click="daysFilter">Submit</b-button>
                </b-form>
            </b-col>

            <b-col cols=6 style="display: flex" v-if="selected === 'date'">
                    <datepicker
                        :disabled-dates= 'disabledStartDates'
                        v-model= 'startDate'
                        placeholder='  Start date'
                        style="flex-grow: 1; align-self: center">
                    </datepicker>
                    <datepicker
                        :disabled-dates= 'disabledEndDates'
                        :highlighted= '{dates: [new Date()]}'
                        v-model= 'endDate'
                        placeholder='  End date'
                        style="flex-grow: 1; align-self: center">
                    </datepicker>
                    <b-button variant="primary" v-on:click="dateFilter">Submit</b-button>
            </b-col>

        </b-row>
    </b-container>
</template>


<script>
import Datepicker from 'vuejs-datepicker';;

export default {
    name: 'TrackFilter',
    components: { Datepicker },
    data: () => ({
      selected: 'days',
      numberOfDays: 1,
      startDate: new Date(new Date().setDate(new Date().getDate()-1)),  // yesterday's date
      endDate: new Date(),
      options: [
          { value: 'days', text: 'Tracks played in the last x days'},
          { value: 'date', text: 'Tracks played between two dates'}
      ]
  }),
    computed: {
        disabledStartDates: function() {
            if (this.endDate) {
                return { from: this.endDate }
            }
        },
        disabledEndDates: function() {
            return { to: this.startDate, from: new Date() }
        }
    },
    methods: {
        daysFilter: function() {
            if (this.numberOfDays) {
                this.$emit('days-filter', this.numberOfDays)
            }
        },

        dateFilter: function() {
            if (this.startDate && this.endDate) {
                this.$emit('date-filter', this.startDate, this.endDate)
            }
        }
    }
}
</script>

<style scoped>

</style>
