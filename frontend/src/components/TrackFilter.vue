<template>
    <div>
        <b-tabs content-class="mt-3" fill>
            <b-tab title="Past X Days" active>
                <b-form inline>
                    <b-input
                        v-model="numberOfDays"
                        required
                        placeholder="days"
                        class="mr-3"
                        type="number"
                        min="1"
                    ></b-input>

                    <b-button variant="outline-primary" v-on:click="daysFilter">Update</b-button>
                </b-form>
            </b-tab>
            <b-tab title="Between Dates">
                <b-form inline>
                    <b-form-datepicker class="mr-3" v-model="startDate"></b-form-datepicker>
                    <b-form-datepicker class="mr-3" v-model="endDate"></b-form-datepicker>

                    <b-button variant="outline-primary" v-on:click="dateFilter">Update</b-button>
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
