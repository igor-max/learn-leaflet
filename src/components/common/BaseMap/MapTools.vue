<template>
  <div>
    <el-button-group>
      <el-button
        v-for="(item, index) in data"
        :key="index"
        :type="curIndex === index ? 'primary' : ''"
        @click="handleClick(item, index)"
        >{{ item }}</el-button
      >
    </el-button-group>
  </div>
</template>

<script>
export default {
  name: "MapTools",
  data() {
    return {
      curIndex: -1,
      data: ["point", "polyline", "polygon"],
    };
  },
  methods: {
    handleClick(item, index) {
      if (this.curIndex === index) {
        this.curIndex = -1;
        this.$emit("endDraw");
      } else {
        this.curIndex = index;
        this.$emit("draw" + item[0].toUpperCase() + item.slice(1));
      }
    },
  },
};
</script>

<style>
</style>