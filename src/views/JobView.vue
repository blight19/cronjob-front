<template>
    <div class="jobs">
        <el-row>
            <el-button type="primary" plain @click="edit=true;createFormVisible = true;form={}">添加任务</el-button>
            <el-button type="success" plain @click="getHealthWorker">健康节点</el-button>

        </el-row>
        <br>
        <el-row>
            <el-table :data="currentJobs" border style="width: 100%">
                <el-table-column prop="name" label="任务名称" min-width="180">
                </el-table-column>
                <el-table-column prop="command" label="命令" min-width="180">
                </el-table-column>
                <el-table-column prop="cronExpr" label="Cron表达式" width="300">
                </el-table-column>
                <el-table-column label="操作">

                    <template slot-scope="scope">
                        <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-popconfirm title="确定强杀？" @confirm="handleKill(scope.$index, scope.row)">
                            <el-button slot="reference" size="mini">强杀</el-button>
                        </el-popconfirm>
                        <el-popconfirm title="确定删除？" @confirm="handleDelete(scope.$index, scope.row)">
                            <el-button slot="reference" size="mini">删除</el-button>
                        </el-popconfirm>
                        <el-button size="mini" @click="handleLog(scope.$index, scope.row)">日志</el-button>
                    </template>

                </el-table-column>
            </el-table>
        </el-row>

        <el-dialog title="添加任务" :visible.sync="createFormVisible">
            <el-form :model="form">
                <el-form-item label="任务名称" :label-width="formLabelWidth">
                    <el-input v-model="form.name" autocomplete="off" v-if="edit"></el-input>
                    <div v-else>{{ form.name }}</div>
                </el-form-item>
                <el-form-item label="命令" :label-width="formLabelWidth">
                    <el-input v-model="form.command" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="Cron表达式" :label-width="formLabelWidth">
                    <el-input v-model="form.cronExpr" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="createFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </div>
        </el-dialog>

        <el-drawer title="" :visible.sync="tableShow" :with-header="false" size="80%">
            <span class="table-title">任务:{{ logFormName }}</span>
            <el-table :data="logs">
                <el-table-column property="OutPut" label="执行输出"></el-table-column>
                <el-table-column property="PlanTime" label="计划时间"></el-table-column>
                <el-table-column property="ScheduleTime" label="调度时间"></el-table-column>
                <el-table-column property="StartTime" label="开始时间"></el-table-column>
                <el-table-column property="EndTime" label="结束时间"></el-table-column>
            </el-table>
            <el-pagination background
                           layout="prev, pager, next" :current-page="logCurrPage"
                           :page-count="logTotalPage" @current-change="changeLogPage">
            </el-pagination>
        </el-drawer>

        <el-dialog title="健康节点" :visible.sync="helthDialogShow" width="500px">
            <el-table :data="worker" width="250px">
                <el-table-column property="name" label="节点" width="200"></el-table-column>
                <el-table-column property="start-time" label="启动时间" width="200"></el-table-column>
            </el-table>
        </el-dialog>

    </div>


</template>

<script>
import Vue from "vue";
var axios = require('axios');
var qs = require('qs');
export default {

    data() {
        return {
            createFormVisible: false,
            helthDialogShow:false,
            logFormVisiable: false,
            logFormName: "",
            form: {
                name: '',
                command: '',
                cronExpr: ''
            },
            formLabelWidth: '120px',
            currentJobs: [],
            worker:[],
            edit: true,
            tableShow: false,
            logs: [],
            logCurrPage: 0,
            logTotalPage: 0,
        };
    },
    methods: {
        getHealthWorker(){
            var config = {
                method: 'post',
                url: '/job/workers',
            };
            let _this=this
            axios(config)
              .then(function (response) {
                  _this.worker = response.data.data
                  _this.helthDialogShow=true
              })
              .catch(function (error) {
                  console.log(error);
              });
        },
        submitForm() {
            const jobInfo = JSON.stringify(
              {
                  "name": this.form.name,
                  "command": this.form.command,
                  "cronExpr": this.form.cronExpr
              }
            );
            const data = qs.stringify({
                'job': jobInfo
            });
            const config = {
                method: 'post',
                url: '/job/save',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };
            let _this = this
            axios(config)
              .then(function (response) {
                  console.log(JSON.stringify(response.data));
                  if (response.data.code === 0) {
                      _this.$message({
                          message: '添加成功',
                          type: 'success'
                      });
                      _this.handleList()
                  } else {
                      _this.$message.error('出错了!' + response.data.msg);
                  }
              })
              .catch(function (error) {
                  console.log(error);
              });
            this.createFormVisible = false;
        },
        handleEdit(index, row) {
            this.edit = false
            this.createFormVisible = true;
            this.form.name = row.name
            this.form.cronExpr=row.cronExpr
            this.form.command=row.command

        },
        handleDelete(index, row) {
            const data = qs.stringify({
                'name': row.name
            });
            const config = {
                method: 'post',
                url: '/job/delete',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };
            let _this = this;
            axios(config)
              .then(function (response) {
                  if (response.data.code === 0) {
                      _this.$message.success("删除成功");
                      _this.handleList()
                  } else {
                      _this.$message.error("出错了!" + response.data.msg)
                  }

              })
              .catch(function (error) {
                  _this.$message.error("出错了!" + error)
              });

        },
        handleKill(index, row) {
            const data = qs.stringify({
                'name': row.name
            });
            const config = {
                method: 'post',
                url: '/job/kill',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };
            let _this = this;
            axios(config)
              .then(function (response) {
                  if (response.data.code === 0) {
                      _this.$message.success("强杀成功");
                      _this.handleList()
                  } else {
                      _this.$message.error("出错了!" + response.data.msg)
                  }

              })
              .catch(function (error) {
                  _this.$message.error("出错了!" + error)
              });
        },
        changeLogPage(page) {
            var data = qs.stringify({
                'name': this.logFormName,
                'page': page
            });
            var config = {
                method: 'post',
                url: '/job/log',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };
            var _this = this
            axios(config)
              .then(function (response) {
                  if (response.data.code === 0) {
                      function paddingNum(num, n) {
                          var len = num.toString().length
                          while (len < n) {
                              num = '0' + num
                              len++
                          }
                          return num
                      }

                      function trans2time(m) {
                          m = m / 1000
                          const date = new Date(m);
                          const year = date.getFullYear();
                          const month = paddingNum(date.getMonth() + 1, 2);
                          const day = paddingNum(date.getDate(), 2);
                          const hour = paddingNum(date.getHours(), 2);
                          const minute = paddingNum(date.getMinutes(), 2);
                          const second = paddingNum(date.getSeconds(), 2);
                          const millsecond = paddingNum(date.getMilliseconds(), 3);
                          return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second + "." + millsecond
                      }

                      _this.logs = []
                      for (const responseElement of response.data.data.log) {
                          _this.logs.push({
                              'OutPut': responseElement.OutPut,
                              'EndTime': trans2time(responseElement.EndTime),
                              'ScheduleTime': trans2time(responseElement.ScheduleTime),
                              'StartTime': trans2time(responseElement.StartTime),
                              'PlanTime': trans2time(responseElement.PlanTime),
                          })
                      }
                      _this.logTotalPage = response.data.data.total_page
                      _this.logCurrPage = response.data.data.curr_page
                  }

              })
              .catch(function (error) {
                  console.log(error);
              });
        },
        handleLog(index, row) {
            this.tableShow = true;
            this.logFormName = row.name;
            this.logCurrPage = 1;
            this.changeLogPage(1);

        },
        handleList() {
            Vue.axios.post("/job/list",
            ).then((response => {
                  this.currentJobs = response.data.data

              })
            ).catch(function (error) {
                console.log(error);
            })
        },
        test(index, row) {
            console.log(index, row)
        }
    },
    mounted: function () {
        this.handleList()
    }
};

</script>
<style scoped>
.table-title {
    font-size: 18px;
    padding: 20px;
    margin-top: 100px;
}
</style>