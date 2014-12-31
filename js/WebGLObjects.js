/**
 * WebGL Objects Module
 */
var WebGLObjects = (function () {

	var module = {};

	var gl;
	var glProgram;
	var textures;

	var matrix;

	var peer;

	var objects = {};

	function ObjGL(width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff, ibuffextra){
		this.width = width;
		this.height = height;
		this.posX = x;
		this.posY = y;
		this.vbuff = vbuff;
		this.ibuff = ibuff;
		this.txtbuff = txtbuff;
		this.txtid = txtid;
		this.nbuff = nbuff;
		this.ibuffextra = ibuffextra;
	};

	ObjGL.prototype.draw = function() {
		WebGLUtils.pushMatrix();

		mat4.translate(matrix.mv, [this.posX, this.posY, 0.0]);
		mat4.toInverseMat3(matrix.mv, matrix.n);
		mat3.transpose(matrix.n);

		// set the buffer to be drawn and connect up the shader parameters: 
		// vertex position, texture coordinates and vertex normal
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
		gl.vertexAttribPointer(glProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txtbuff);
		gl.vertexAttribPointer(glProgram.vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
		gl.vertexAttribPointer(glProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, matrix.p);
		gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, matrix.mv);
		gl.uniformMatrix3fv(glProgram.normalMatrixUniform, false, matrix.n);

		gl.activeTexture(gl.TEXTURE0 + this.txtid);
		gl.bindTexture(gl.TEXTURE_2D, textures[this.txtid]);
		gl.uniform1i(glProgram.samplerUniform, this.txtid);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuff);
		gl.drawElements(gl.TRIANGLES, this.ibuff.number_vertex_points, gl.UNSIGNED_SHORT, 0);

		if (this.ibuffextra) {
			gl.activeTexture(gl.TEXTURE0 + this.txtid + 1);
			gl.bindTexture(gl.TEXTURE_2D, textures[this.txtid + 1]);
			gl.uniform1i(glProgram.samplerUniform, this.txtid + 1);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibuffextra);
			gl.drawElements(gl.TRIANGLES, this.ibuffextra.number_vertex_points, gl.UNSIGNED_SHORT, 0);
		}

		WebGLUtils.popMatrix();
	};

	function Ball(width, height, x, y, speed, vbuff, ibuff, txtbuff, txtid, nbuff) {
		ObjGL.call(this, width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff);
		this.DirX = 1;
		this.DirY = 1;
		this.speed = speed;
	};
	Ball.prototype = new ObjGL();

	Ball.prototype.move = function() {
		var limitX = Settings.field.width / 2.0 - 0.8*this.width;
		var limitY = Settings.field.height / 2.0 - 0.8*this.width;

		if (this.posX >= limitX || this.posX <= -limitX) {
			this.DirX = -this.DirX;
		}
		if (this.posY >= limitY || this.posY <= -limitY) {
			this.DirY = -this.DirY;
		}

		// update ball position
		this.posX += this.DirX * this.speed;
		this.posY += this.DirY * this.speed;
	}

	function Paddle(width, height, x, y, speed, vbuff, ibuff, txtbuff, txtid, nbuff) {
		ObjGL.call(this, width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff);
		this.speed = speed;
	}
	Paddle.prototype = new ObjGL();

	Paddle.prototype.move = function() {
		var limitX = Settings.field.width / 2.0 - this.width;

		// move right
		if (Key.isDown(Key.RIGHT) || (Key.isDown(Key.D))) {
			if (peer.isInitiator) {
				if (this.posX <= limitX) {
					// update paddle position
					this.posX += this.speed;
				}
			} else {
				if (this.posX >= -limitX) {
					// update paddle position
					this.posX -= this.speed;
				}
			}

		}
		// move left
		else if (Key.isDown(Key.LEFT) || (Key.isDown(Key.A))) {
			if (peer.isInitiator) {
				if (this.posX >= -limitX) {
					// update paddle position
					this.posX -= this.speed;
				}
			} else {
				if (this.posX <= limitX) {
					// update paddle position
					this.posX += this.speed;
				}
			}
		}
	};

	Paddle.prototype.logic = function() {
		if (objects.ball.posX >= this.posX - Settings.paddle.width &&
				objects.ball.posX <= this.posX + Settings.paddle.width &&
				objects.ball.posY >=  this.posY - Settings.paddle.height &&
				objects.ball.posY <=  this.posY + Settings.paddle.height ) {
						objects.ball.DirX = -objects.ball.DirX;
						objects.ball.DirY = -this.posY * 0.7;
		}
	};

	module.start = function(p) {
		gl = WebGLUtils.getGL();
		glProgram = WebGLUtils.getGLProgram();
		textures = WebGLUtils.getGLTextures();

		matrix = WebGLUtils.getMatrix();

		var buffers = WebGLBuffers.get();

		peer = p;

		objects.field = new ObjGL(Settings.field.width, Settings.field.height, 0.0, 0.0, 
				buffers.field.vertex, buffers.field.vindex, buffers.field.vtexture, Settings.field.texture, 
				buffers.field.vnormal, buffers.field.vindexextra);

		objects.ball = new Ball(Settings.ball.width, Settings.ball.width, 0.0, 0.0, Settings.ball.speed, 
				buffers.ball.vertex, buffers.ball.vindex, buffers.ball.vtexture, Settings.ball.texture,
				buffers.ball.vnormal);

		objects.paddle1 = new Paddle(Settings.paddle.width, Settings.paddle.height, 0.0,
				-Settings.field.height / 2.0 + 3.5*Settings.paddle.height, Settings.paddle.speed,
				buffers.paddle.vertex, buffers.paddle.vindex, buffers.paddle.vtexture, 
				Settings.paddle.texture1, buffers.paddle.vnormal);

		objects.paddle2 = new Paddle(Settings.paddle.width, Settings.paddle.height, 0.0,
				Settings.field.height / 2.0 - 3.5*Settings.paddle.height, Settings.paddle.speed,
				buffers.paddle.vertex, buffers.paddle.vindex, buffers.paddle.vtexture,
				Settings.paddle.texture2, buffers.paddle.vnormal);

		return objects;
  };

	return module;
}());