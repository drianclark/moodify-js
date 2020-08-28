<template>
    <div>
        <b-tabs content-class="mt-3" fill>
            <b-tab aria-label="Show music mood over x days" id="byDays" title="Past X Days" active>
                <b-form inline>
                    Show me my music's mood over the past
                    <b-input
                        v-model="numberOfDays"
                        required
                        placeholder="days"
                        class="mx-3"
                        type="number"
                        min="1"
                        aria-labelledby="byDays"
                    ></b-input>
                    day{{ numberOfDays == 1 ? "" : "s" }}
                    <b-button variant="outline-primary" v-on:click="daysFilter" class="ml-3">Update</b-button>
                </b-form>
            </b-tab>
            <b-tab title="Between Dates">
                <b-form inline>
                    Show me my music's mood between
                    <b-form-datepicker class="mx-3" v-model="startDate"></b-form-datepicker>and
                    <b-form-datepicker class="ml-3" v-model="endDate"></b-form-datepicker>

                    <b-button variant="outline-primary" v-on:click="dateFilter" class="ml-3">Update</b-button>
                </b-form>
            </b-tab>
        </b-tabs>
    </div>
</template>


<script>
export default {
    name: "TrackFilter",
    data: () => ({
        selected: "days",
        numberOfDays: 1,
        startDate: new Date(new Date().setDate(new Date().getDate() - 1)), // yesterday's date
        endDate: new Date(),
        options: [
            { value: "days", text: "Tracks played in the last x days" },
            { value: "date", text: "Tracks played between two dates" }
        ]
    }),
    computed: {
        disabledStartDates: function() {
            return { from: this.endDate };
        },
        disabledEndDates: function() {
            return { to: this.startDate, from: new Date() };
        }
    },
    methods: {
        daysFilter: function() {
            if (this.numberOfDays) {
                this.$emit("days-filter", this.numberOfDays);
            }
        },

        dateFilter: function() {
            if (this.startDate && this.endDate) {
                this.$emit("date-filter", this.startDate, this.endDate);
            }
        }
    }
};
</script>

<style scoped>
</style>
