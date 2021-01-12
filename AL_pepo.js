
function AL_Pepo(){
	
	/*
	VARIABLES 
	*/
	
	var all_script_nodes =  node.getNodes(['SCRIPT_MODULE']);
	
	var pepo_list = Array();
	
	var current_frame = frame.current()
	
	var GENERAL_SENSITIVITY = 1;
	
	MessageLog.trace(all_script_nodes);
	
	/*
	EXCUTION
	*/	
	
	
	pepo_list = fetch_pepos(all_script_nodes);
	
	var frame_start = scene.getStartFrame ();
	var frame_scope = scene.getStopFrame ();
	
	write_expo(pepo_list,GENERAL_SENSITIVITY,frame_start,frame_scope);
	
	/*
	FUNCTION 
	*/	
		
	function fetch_pepos(node_list){
		
		var list = [];
		
		for(var n = 0 ; n < node_list.length ; n++){
			
			var current_node = node_list[n];
			
			MessageLog.trace(current_node);
			
			if(check_node(current_node)){
				
				list.push(current_node);
				
				MessageLog.trace(current_node);
				
			}
	
		}
		
		return list;
			
		
	}
	
	
	function treat_pepos(node_list,active_frame,general_sensitivity){
	
		for(var n = 0 ; n < node_list.length ; n++){
			
			var current_node = node_list[n];
			
			var input_peg = get_input_peg(current_node);
			var output_read =  get_output_read(current_node);
			
			//MessageLog.trace(input_peg);
			//MessageLog.trace(output_read);
			
			var X = node.getTextAttr(input_peg,active_frame,'POSITION.X');
			var Y = node.getTextAttr(input_peg,active_frame,'POSITION.Y');
			
			var sensitivity = node.getTextAttr(current_node,active_frame,'sensitivity');
			var exposure = node.getTextAttr(current_node,active_frame,'exposure');
			
			var final_range = 1/(sensitivity*general_sensitivity);
			
		
			
			MessageLog.trace("sensitivity : "+sensitivity);
			MessageLog.trace("exposure : "+exposure);

			var currentColumn = get_read_timing_column(output_read);
			var sub_timing = column.getDrawingTimings(currentColumn);
			var number_of_subs = sub_timing.length;
		
			var last_sub = column.getEntry (currentColumn,1,active_frame-1)
			
			var last_index = sub_timing.indexOf(last_sub);
			
			var sub_index = last_index;
			
			MessageLog.trace(last_sub);
			
			MessageLog.trace(sub_index);
			


			if((active_frame-1) % exposure == 0){
				
				sub_index =calculate_index(X,final_range,number_of_subs,"cos");
				
			}
			
			if(active_frame == 1){
				
				sub_index = 1;
				
			}
			
			var SELECTED_SUB = sub_timing[sub_index];
			
			
			

			
			column.setEntry(currentColumn,1,active_frame,SELECTED_SUB);	

		}
		
	}
	

	
	function calculate_index(value,range,scope,type){
		
		function remove_sign(n){
			return Math.sqrt(n*n);
		}	
		
		if(type == "cos"){
			return remove_sign(Math.round(Math.cos(value/range)*(scope-1)));
		}
		
		if(type == 'sin'){
			return remove_sign(Math.round(Math.sin(value/range)*(scope-1)));
		}
		
	}
	
	function write_expo(node_list,range,start_frame,number_of_frames){
		 
		for (var i = start_frame ; i < number_of_frames+1 ; i++){
		
			treat_pepos(node_list,i,range);
			
		}
		
	}
	
	function clear_timeline(){
		
		
		
	}
	
	function get_read_timing_column(read){
		
		for (var i = 0; i < Timeline.numLayers; i++) {

			if (Timeline.layerIsColumn(i)) {

				var currentColumn = Timeline.layerToColumn(i);

				if (column.type(currentColumn) == "DRAWING") {

					var drawing_node = Timeline.layerToNode(i);

					if (drawing_node == read) {

						return currentColumn;
						
					}
				}
			}
		}

	}
	
	function get_input_peg(n){

		var numInput = node.numberOfInputPorts(n);
		
		var source = node.srcNode(n,numInput-1);
		
		return source;

	}
	
	

	function get_output_read(n){
		
		return node.dstNode(n, 0, 0); 
		
	}

	
	function check_node(n){
		
		var check = false;
		
		

		var ispepo = node.getTextAttr(n,current_frame,'isPepo');
		
		MessageLog.trace(ispepo);
		
		if(ispepo == 'Y'){
			
			check = true;
		}
		
		return  check;
		
	}
	
	
	
}
/*
SCRIPT MODULE ATTRIBUTES 
<specs>
  <ports>
    <in type="PEG"/>
    <out type="IMAGE"/>
  </ports>
  <attributes>
<attr type="bool" name="isPepo" value="true"/> 
<attr type="int" name="sensitivity" value="10"/> 
<attr type="int" name="exposure" value="1"/> 
  </attributes>
</specs>


}*/
