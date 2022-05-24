<template>
    <div id="app">
        <div v-if="islogin">
            <el-container>
                <el-header>
                    <div id="nav">
                        <Menu></Menu>
                    </div>
                </el-header>
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </div>

        <div v-else>
            <login-view></login-view>
        </div>


    </div>
</template>

<script>
import Menu from "@/components/Menu";
import LoginView from "@/views/LoginView";
export default {
    name:"APP",
    components:{
        LoginView,
        Menu
    },
    data() {
        return {
            "islogin":false
        }
    },
    methods:{

    },
    mounted: function () {

        if(window.sessionStorage.getItem("token")){
            this.islogin=true
        }else {
            this.islogin=false
        }
    }

}
</script>

