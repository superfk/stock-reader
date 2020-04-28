
let tools = require('./shared_tools');

module.exports = {
    // **************************************
    // input paras constructor
    // **************************************
    BooleanPara: function (name, value, unit='', readOnly=false) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.type = 'bool';
        this.readOnly = readOnly;
    },

    NumberPara: function(name, value, unit='', max=null, min=null, readOnly=false) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.max = max;
        this.min = min;
        this.type = 'number';
        this.readOnly = readOnly;
    },

    TextPara: function(name, value, unit='', readOnly=false) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.type = 'text';
        this.readOnly = readOnly;
    },

    OptionPara: function(name, value, options, unit='', readOnly=false) {
        this.name = name;
        this.value = value;
        this.unit = unit;
        this.options = options;
        this.type = 'select';
        this.readOnly = readOnly;
    },

    // **************************************
    // Sequence render functions
    // **************************************

    genTempPara: function(){
        let paras= [
            new module.exports.NumberPara('target temperature',20,unit='&#8451',max=190,min=-40,readOnly=false),
            new module.exports.NumberPara('tolerance',1,unit='&#8451',max=10,min=0,readOnly=false),
            new module.exports.NumberPara('slope',5,'K/min',max=100,min=-100,readOnly=false),
            new module.exports.NumberPara('increment',0,'&#8451',max=100,min=-100,readOnly=false)
        ]
        
        // UIkit.modal('#parasModal').show();
        return module.exports.makeSingleStep('temperature', 'ramp', paras, true);
    },
    genHardPara: function(){
        let paras= [
            // new TextPara('port','COM3',unit='',readOnly=false),
            new module.exports.OptionPara('mode','STANDARD_M','STANDARD_M,STANDARD_M_GRAPH',unit='',readOnly=false),
            new module.exports.OptionPara('method','shoreA','shoreA,shore0',unit='',readOnly=false),
            new module.exports.NumberPara('measuring time',5,unit='sec',max=99,min=1,readOnly=false),
            new module.exports.NumberPara('number of measurement',3,unit='',max=10,min=1,readOnly=false),
            new module.exports.OptionPara('numerical method','mean','mean,median',unit='',readOnly=false)
        ]
        return module.exports.makeSingleStep('hardness', 'measure', paras);
    },
    genWaitPara: function(){
        let paras= [
            new module.exports.NumberPara('conditioning time',5,unit='minute',max=480,min=0,readOnly=false)
        ]
        return module.exports.makeSingleStep('waiting', 'time', paras);
    },
    genLoopPara: function(alwayIncrLoopColorIdx){
        let loopID = Math.floor(Math.random() * 100000000);
        let loopColor = tools.pick_color_hsl(alwayIncrLoopColorIdx);
        alwayIncrLoopColorIdx +=1;
        let loop_counts = 1;
        let paras= [
            new module.exports.NumberPara('loop id',loopID,unit='',max=null,min=0,readOnly=true),
            new module.exports.NumberPara('loop counts',loop_counts,unit='',max=100,min=0,readOnly=false),
            new module.exports.TextPara('loop color',loopColor,unit='',readOnly=true)
        ]
        let lpStartStep = module.exports.makeSingleStep('loop', 'loop start', paras);
        
        paras= [
            new module.exports.NumberPara('stop on',loop_counts,unit='',max=null,min=0,readOnly=true),
            new module.exports.NumberPara('loop id',loopID,unit='',max=null,min=0,readOnly=true),
            new module.exports.TextPara('loop color',loopColor,unit='',readOnly=true)
        ];
            
        let lpEndStep = module.exports.makeSingleStep('loop', 'loop end', paras);
        return {start:lpStartStep, end:lpEndStep}
    },
    genUnit: function(unit) {
        if (unit === '' || unit === null) {
            return '';
        }else{
            return '(' + unit + ')';
        }
    },

    makeSingleStep: function (cat, subitem, paras, enabled=true, stepid=0) {

        let unitStep = {
            id: stepid,
            cat: cat, // 'hardness' | 'waiting' | 'action'
            subitem: {
                item: subitem, //'rampdown' 'keep' | 'measure' | 'sec' 'min' 'hour' 'tempInRange' | 'fanOff' 'fanOn' 'rotate' 'DO_out'
                paras: paras,
                enabled: enabled
            }
            
        }
        return unitStep;
    },

    genStepTitles: function (seq){
        let titles = [];
        for (i = 0; i < seq.length; i++) {
            let {cat, subitem} = seq[i];
            // titles.push(`Step ${i+1} :: ${tools.capitalize(cat)} :: ${tools.capitalize(subitem['item'])}`);
            titles.push(`Step ${i+1} :: ${tools.capitalize(cat)}`);
        }
      
        return titles;
      },

    genProgBarByCat: function(cat){
        let prgbar = '';
        if (cat == 'temperature' || cat == 'waiting' || cat == 'teardown' || cat == 'hardness'){
            prgbar = `<progress max="100" value="0" class='stepProg'></progress>`
        }
        return prgbar;
    },
    
    generateSeq: function(seq, editable=false) {
        let stepTitles = module.exports.genStepTitles(seq);
        let curstr = '';
        seq.forEach((item,index)=>{
            seq[index].id = index;
            let {cat, subitem} = seq[index];
            let en = subitem['enabled'];
            if (!editable){
               en = subitem['enabled']?'':'disabledStep';
            }
            let stepParaText = module.exports.genShortParaText(cat,subitem);
            curstr += `
            <li data-stepid=${index} data-sortable=true ${en}' >
                <div class='w3-bar'>
                    <a href="#" class='w3-bar-item stepParas'>
                        ${module.exports.genIconByCat(cat,subitem['paras'])}${stepTitles[index]}${stepParaText}
                    </a>
                    <div class="w3-bar-item w3-right lopCount">00</div>
                    ${editable?
                    `<div class='w3-bar-item w3-right' style='width:50px'>${module.exports.genDeleteIcon(index)}</div>
                    <div class='w3-bar-item w3-right' style='width:50px'>${module.exports.genEnableIcon(index,en)}</div>`
                    :
                    `<div class="w3-bar-item w3-right stepResult"></div>`
                    }
                </div>
                ${editable?'':module.exports.genProgBarByCat(cat)}      
            </li>
            `;
        });
        return curstr;
      },

      generateStartSeq: function (setup_seq, editable=false) {
        let stepParaText = "";
        let curstr = `
        <li class='w3-flat-nephritis' data-stepid=-1>
          <div class='w3-bar'>
            <a href="#" class='w3-bar-item'>
                ${module.exports.genIconByCat(setup_seq.cat, setup_seq.subitem['paras'])}Sequence Setup${stepParaText}
            </a>
            <div class="w3-bar-item w3-right lopCount">00</div>
            ${editable?
                `<div class='w3-bar-item w3-right w3-small' style='width:50px' >Delete</div>
                <div class='w3-bar-item w3-right w3-small' style='width:50px' >Enable</div>`
                :
                ``
                }
          </div> 
        </li>
        `;
        return curstr;
      },

      genTeardownTest: function (paras=null){
          if (paras==null){
            paras= [
                new module.exports.NumberPara('safe temperature',30,unit='&#8451',max=50,min=0,readOnly=false)
            ]
          }
        teardown_seq = module.exports.makeSingleStep('teardown','teardown', paras, true, 9999);
        return teardown_seq;
    },
      
      generateEndSeq: function (teardown_seq, editable=false) {
        let stepParaText = module.exports.genShortParaText(teardown_seq.cat, teardown_seq.subitem);
        let curstr = `
        <li class='w3-flat-alizarin' data-stepid=9999>
            <div class='w3-bar'>
                <a href="#" class='w3-bar-item'>
                    ${module.exports.genIconByCat(teardown_seq.cat, teardown_seq.subitem['paras'])}Sequence Teardown${stepParaText}
                </a>
            </div>
            ${editable?'':module.exports.genProgBarByCat(teardown_seq.cat)}  
            
        </li>
        `;
        return curstr;
      },

    sortSeq: function(container_id, setup_seq, seq, teardown_seq, editable=false){
        let middleSeqs =  module.exports.generateSeq(seq, editable);
        $('#'+container_id).html(module.exports.generateStartSeq(setup_seq, editable) + middleSeqs + module.exports.generateEndSeq(teardown_seq, editable));
        let revSeq = seq.slice();
        revSeq.reverse().forEach((item,index)=>{
          if(item.cat==='loop' && item.subitem['item']=='loop end'){
              let loopid = item.subitem.paras.filter(item=>item.name=='loop id')[0].value;
              let ids = module.exports.searchLoopStartEndByID(loopid, seq);
              module.exports.genLoopIndicator(container_id, seq, ids[0],ids[1]);
          }
          
        })
      },

      genLoopIndicator:　function(container_id, seq, start, end){
        if(start<0 || end<0){
            return null;
        }
        let liItem = $('#' + container_id + ' li');
        // ignore settup step
        start+=1;
        end+=1;
        liItem.each((index,item)=>{
            let loopCount = seq[start-1].subitem['paras'].filter(item=>item.name=='loop counts')[0].value;
            let loopColor = seq[start-1].subitem['paras'].filter(item=>item.name=='loop color')[0].value;
            if(index==start){
                $(item).addClass('loop loopStart');
                $(item).find('.lopCount').addClass('lopCount-start-enabled').html(loopCount).css("cssText","border-color:"+loopColor + ' !important');
                $(item).css("cssText","box-shadow: 2px 0px 0px 0px "+ loopColor + ' !important');
            }else if (index > start && index < end){
                $(item).addClass('loop');
                $(item).css("cssText","box-shadow: 2px 0px 0px 0px "+ loopColor + ' !important');
            }else if (index===end){
                loopCount = seq[start-1].subitem['paras'].filter(item=>item.name=='loop counts')[0].value;
                loopColor = seq[start-1].subitem['paras'].filter(item=>item.name=='loop color')[0].value;
                $(item).addClass('loop loopEnd');
                $(item).find('.lopCount').addClass('lopCount-enabled').html(loopCount).css("background-color",loopColor);
                $(item).css("cssText","box-shadow: 2px 0px 0px 0px "+ loopColor + ' !important');
            }           
            
        })
        
      },

      genParas: function (paras,input=false) {
        let c = '';
        paras.forEach(function(item, index, array){
            if (input) {
                let t = item['type'];
                let ronly = item['readOnly']?'disabled':'';
                if (t === 'text'){
                    c += `<li><label>${tools.capitalize(item['name'])} ${module.exports.genUnit(item['unit'])}</label> <input class='w3-input w3-border-bottom w3-cell' value='${item['value']}' type='text' ${ronly}></li>`;
                }else if (t === 'number'){
                    let maxValue = item['max']===null?'':`max='${item['max']}'`;
                    let minValue = item['min']===null?'':`min='${item['min']}'`;
                    let plhValue = item['min']===null?'no limit':`${item['min']}`
                    plhValue += "~"
                    plhValue += item['max']===null?'no limit':`${item['max']}`
                    plhValue = "placeholder='" + plhValue + "'"
                    console.log(maxValue, minValue, plhValue)
                    c += `<li><label>${tools.capitalize(item['name'])} ${module.exports.genUnit(item['unit'])}</label>
                    <input class='w3-input w3-border-bottom w3-cell' value='${item['value']}' type='number' ${maxValue} ${minValue} ${plhValue} ${ronly}></li>`;
      
                }else if (t === 'bool'){
                    c += `<li><input class='w3-check w3-border-bottom w3-cell' checked=${item['value']} type='checkbox' ${ronly}><label> ${tools.capitalize(item['name'])} ${module.exports.genUnit(item['unit'])}
                    </label></li>`;
                    
                }else if (t === 'select'){
                    let op = item['options'];
                    let selectedOP = item['value']
                    let ops = op.split(',');
                    let opItems = '';
                    ops.forEach((item)=>{
                        if(selectedOP==item){
                            opItems += `<option value="${item}" ${ronly} selected>${item}</option>`;
                        }else{
                            opItems += `<option value="${item}" ${ronly}>${item}</option>`;
                        }
                        
                    })
                    c += `<li><label>${tools.capitalize(item['name'])} ${module.exports.genUnit(item['unit'])}</label> 
                    <select class="w3-select w3-border" name="option">${opItems}</select></li>`;
                }
            }else{
                c += `<li style='font-size:12px;'><label><b>${tools.capitalize(item['name'])} ${module.exports.genUnit(item['unit'])}</b></label>: ${item['value']}</li>`;
            }
          
        });
        return c;
      },
      
      genIconByCat: function (cat,paras=null){
        let iconset = '';
        let loopColor = '';
        if (cat === 'temperature'){
            iconset = 'fas fa-thermometer-quarter';
        }else if (cat === 'hardness'){
            iconset = 'fas fa-download';
        }else if (cat === 'waiting'){
            iconset = 'fas fa-hourglass-start';
        }else if (cat === 'loop'){
            loopColor = paras.filter(item=>item.name=='loop color')[0].value;
            iconset = 'fas fa-retweet';
        }else if (cat === 'subprog'){
            iconset = 'fas fa-indent';
        }else if (cat === 'setup'){
            iconset = 'far fa-play-circle';
        }else if (cat === 'teardown'){
            iconset = 'far fa-stop-circle';
        }
        return `<i class="${iconset} w3-margin-right fa-lg w3-center" style='width:20px;color:${loopColor}'></i>`
      },
      
      
      genShortParaText: function (cat,subitem){
        let {item, paras} = subitem;
        let mainText = '';
        
        if (cat === 'temperature'){
            let tTempPara = paras.filter(item=>item.name=='target temperature')[0];
            let tTolPara = paras.filter(item=>item.name=='tolerance')[0];
            let slopePara = paras.filter(item=>item.name=='slope')[0];
            let increPara = paras.filter(item=>item.name=='increment')[0];
            mainText = `target:${tTempPara.value}${tTempPara.unit}, tol: ${tTolPara.value}${tTolPara.unit} slope:${slopePara.value} ${slopePara.unit}, 
            incre:${increPara.value} ${increPara.unit}`;
        }else if (cat === 'hardness'){
            let methodPara = paras.filter(item=>item.name=='method')[0];
            let modePara = paras.filter(item=>item.name=='mode')[0];
            let mtPara = paras.filter(item=>item.name=='measuring time')[0];
            let nomearPara = paras.filter(item=>item.name=='number of measurement')[0];
            let nummethodPara = paras.filter(item=>item.name=='numerical method')[0];
            mainText = `${methodPara.value}, ${modePara.value}, mearTime:${mtPara.value}${mtPara.unit}, mearCounts:${nomearPara.value}, ${nummethodPara.value} `;
        }else if (cat === 'waiting'){
            let cdtPara = paras.filter(item=>item.name=='conditioning time')[0];
            mainText = `conditioningTime:${cdtPara.value} ${cdtPara.unit}`;
        }else if (cat === 'loop'){
            if(item=='loop start'){
                let loopPara = paras.filter(item=>item.name=='loop id')[0];
                let loopCountPara = paras.filter(item=>item.name=='loop counts')[0];
                mainText = `Loop START, id:${loopPara.value}, counts:${loopCountPara.value}`;
            }else{
                let loopPara = paras.filter(item=>item.name=='loop id')[0];
                let loopStop = paras.filter(item=>item.name=='stop on')[0];
                mainText = `Loop END, id:${loopPara.value}, stop on: loopCount=${loopStop.value}`;
            }
        }else if (cat === 'subprog'){
            let pathPara = paras.filter(item=>item.name=='path')[0];
            mainText = `path:${pathPara.value}`;
        }else if (cat === 'teardown'){
          let pathPara = paras.filter(item=>item.name=='safe temperature')[0];
          mainText = `safe temperature:${pathPara.value}`;
        }
        return `<div class="paraText">${mainText}</div>`
      },
      
      searchLoopStartEndByID: function (loopid, seq){
        let dummyseq = seq.slice();
        let loopStartID = loopid;
        let loopEndID = loopid;
        dummyseq.forEach((item,index)=>{
            if(item.cat=='loop' && item.subitem.item=='loop start'){
                if(item.subitem.paras.filter(item=>item.name=='loop id')[0].value==loopid){
                    loopStartID=index;
                }
            }else if(item.cat=='loop' && item.subitem.item=='loop end'){
                if(item.subitem.paras.filter(item=>item.name=='loop id')[0].value==loopid){
                    loopEndID=index;
                }
            }
        })
        return [loopStartID,loopEndID]
    },

    genEnableIcon: function (stepID, enabled){
        let iconset = '';
        if (enabled){
            iconset = 'icon enable_list';
        }else{
            iconset = 'icon disable_list';
        }
        return `<i data-stepID=${stepID} class="${iconset} w3-right w3-margin-right"></i>`
    },
    
    genDeleteIcon: function (stepID){
        let iconset = 'icon delete_list';
        return `<i data-stepid=${stepID} class="${iconset} w3-right w3-margin-right"></i>`
    },

    findDiff: function(oldArr, newArr) {
        let diffIndexes = [];
        newArr.forEach((elem,idx, array) => {
            let newIdx = oldArr.indexOf(elem,0);
            diffIndexes.push(newIdx);
        });
        return diffIndexes;
    },
    
    reorderSeq: function(seq, newOrder) {
        let newSeq = [];
        let newMainSeqIdx = newOrder.slice(0);
        newMainSeqIdx.forEach((elem, idx)=>{
            newSeq.push(seq[elem]); 
        })
        return newSeq;
    },
    
    checkLoopValid: function(seqin)
    {
        let totalInvalids = [];
        let idxPairs = [];
        let valid = false
        let loopStartCollection = seqin.filter(item=>item.subitem.item=='loop start');
        // check if start greater than end
        loopStartCollection.forEach((item,index)=>{
            let paras = item.subitem.paras;
            paras.forEach((item,index)=>{
                if(item.name=='loop id'){
                    let lpID = item.value;
                    let ids = module.exports.searchLoopStartEndByID(lpID,seqin);
                    let startidx = ids[0];
                    let endidx = ids[1];
                    idxPairs.push({'id':lpID, 'start': startidx, 'end':endidx})
                    if (startidx>endidx){
                        totalInvalids.push({'valid':false, 'loopid':lpID})
                    }
                }
            })        
        })
        
        // check if loop overlap
        idxPairs.sort(function (a, b) {
            return a.idx - b.idx;
          });
        
        function checkValid(valid) {
            return valid;
        }
        
        let validsCollection = [];
        idxPairs.forEach((item,index,array)=>{
            let uut = item;
            let copyArr = [...array];
            let valids=[];
            copyArr.forEach((elem, idx)=>{
                let otheruut = elem;
                if(otheruut.start<uut.start && otheruut.end<uut.end && otheruut.end>uut.start ){
                    valids.push(false);
                }else if(otheruut.start>uut.start && otheruut.end>uut.end && otheruut.start<uut.end){
                    valids.push(false);
                }else{
                    valids.push(true);
                }
            })
            validsCollection.push(valids.every(checkValid));
        })
        if(totalInvalids.length>0){
            return {'valid':false, 'loopid':totalInvalids[0]['loopid']}
        }else if (!validsCollection.every(checkValid)){
            return {'valid':false, 'loopid':null}
        }else{
            return {'valid':true, 'loopid':null}
        }
    },
    applyChange: function(paraContainerID, test_flow, activePara) {
        let {id, cat, subitem} = activePara;
        let {item, paras} = subitem;
        let paraCollection = null;
        if (cat === 'temperature'){
            paraCollection = $('#'+paraContainerID+' input');
            $.each(paraCollection,(index,item)=>{
            test_flow.main[id].subitem.paras[index].value = $(item).val()
            })
        }else if (cat === 'hardness'){
            paraCollection = $('#'+paraContainerID+' input');
            // let newCOM = paraCollection[0].value;
            let newMearT = paraCollection[0].value;
            let newNumOfTest = paraCollection[1].value;
            // test_flow.main[id].subitem.paras[0].value = newCOM;
            test_flow.main[id].subitem.paras[2].value = newMearT;
            test_flow.main[id].subitem.paras[3].value = newNumOfTest;
            paraCollection = $('#'+paraContainerID+' select');
            let newMethod = $(paraCollection[0]).find('option:selected').text();
            let newMode = $(paraCollection[1]).find('option:selected').text();
            let newNumericMethod = $(paraCollection[2]).find('option:selected').text();
            test_flow.main[id].subitem.paras[0].value = newMethod;
            test_flow.main[id].subitem.paras[1].value = newMode;
            test_flow.main[id].subitem.paras[4].value = newNumericMethod;
            
        }else if (cat === 'waiting'){
            paraCollection = $('#'+paraContainerID+' input');
            $.each(paraCollection,(index,item)=>{
                test_flow.main[id].subitem.paras[index].value = $(item).val()
            })
        }else if (cat === 'loop'){
            let loopid = paras.filter(item=>item.name=='loop id')[0].value;
            let ids = module.exports.searchLoopStartEndByID(loopid,test_flow.main);
            let endloopindex = ids[1]
            paraCollection = $('#'+paraContainerID+' input');
            let newLoopCounts = paraCollection[1].value;
            test_flow.main[id].subitem.paras[1].value = newLoopCounts;
            test_flow.main[endloopindex].subitem.paras[0].value = newLoopCounts;
        }else if (cat === 'subprog'){
            paraCollection = $('#'+paraContainerID+' input');
            $.each(paraCollection,(index,item)=>{
                test_flow.main[id].subitem.paras[index].value = $(item).val()
            })
        }else if (cat === 'teardown'){
            paraCollection = $('#'+paraContainerID+' input');
            $.each(paraCollection,(index,item)=>{
                test_flow.teardown.subitem.paras[index].value = $(item).val()
            })
        }
        return test_flow;
    },
  };