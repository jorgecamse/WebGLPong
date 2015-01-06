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

	/* Get random number between min and max */
	function getRandomInt(min, max) {
		var random = Math.floor(Math.random() * (max - min)) + min;
		if (random === 0){random += 1;}
		return random;
	}

	/* Object GL */
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

	/* Draw object GL */
	ObjGL.prototype.draw = function() {
		WebGLUtils.pushMatrix();

		mat4.translate(matrix.mv, [this.posX, this.posY, 0.0]);
		mat4.toInverseMat3(matrix.mv, matrix.n);
		mat3.transpose(matrix.n);

		// set the buffer to be drawn and connect up the shader parameters: 
		// vertex position, texture coordinates, vertex normal,
		// projection/model/normal matrix
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

	/* Ball object */
	function Ball(width, height, x, y, speed, vbuff, ibuff, txtbuff, txtid, nbuff) {
		ObjGL.call(this, width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff);
		this.DirX = 1;
		this.DirY = -1;
		this.speed = speed*0.02;
	};
	Ball.prototype = new ObjGL();

	/* Move ball */
	Ball.prototype.move = function() {
		var limitX = Settings.field.width / 2.0 - 0.8*this.width;
		var limitY = Settings.field.height / 2.0 - 0.8*this.width;

		if (this.posX >= limitX || this.posX <= -limitX) {
			this.DirX = -this.DirX;
		}
		if (this.posY >= limitY) { // Score a goal paddle1
			this.DirY = -this.DirY;
			WebRTCSignal.sendMessageSync({type: 'score', player: '1'})
		}
		if (this.posY <= -limitY) { // Score a goal paddle2
			this.DirY = -this.DirY;
			WebRTCSignal.sendMessageSync({type: 'score', player: '2'})
		}

		// update ball position
		this.posX += this.DirX * this.speed / 3.0;
		this.posY += this.DirY * this.speed;
	}

	/* Reset position ball */
	Ball.prototype.reset = function(loser) {
		this.posX = 0.0;
		this.posY = 0.0;

		if (loser == 1) {
			this.DirY = 1;
		} else {
			this.DirY = -1;
		}

		this.DirX = 1;
	}

	/* Paddle object */
	function Paddle(id, width, height, x, y, speed, vbuff, ibuff, txtbuff, txtid, nbuff) {
		ObjGL.call(this, width, height, x, y, vbuff, ibuff, txtbuff, txtid, nbuff);
		this.id = id;
		this.speed = speed*0.01;
	}
	Paddle.prototype = new ObjGL();

	/* Move paddle */
	Paddle.prototype.move = function() {
		var limitX = Settings.field.width / 2.0 - this.width / 1.5;

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

	/* Ball hits with paddle */
	Paddle.prototype.logic = function() {
		if (objects.ball.posX + objects.ball.width/2.0 >= this.posX - Settings.paddle.width / 2.0 &&
				objects.ball.posX - objects.ball.width/2.0 <= this.posX + Settings.paddle.width / 2.0) {

				if (this.id == 1) {
					if (objects.ball.posY + Settings.ball.width/2.0 <= this.posY + Settings.paddle.height / 2.0) {
						objects.ball.reset(1);
					} else {
						if (objects.ball.posY - objects.ball.width/2.0 <= this.posY + Settings.paddle.height/2.0 &&
								objects.ball.DirY == -1) {
									objects.ball.DirX = getRandomInt(-1,1) * objects.ball.DirX;
									objects.ball.DirY = -objects.ball.DirY;
						}
					}
				} else {
					if (objects.ball.posY - Settings.ball.width/2.0 >= this.posY - Settings.paddle.height / 2.0) {
						objects.ball.reset(2);
					} else {
						if (objects.ball.posY + objects.ball.width/2.0 >= this.posY - Settings.paddle.height/2.0 &&
								objects.ball.DirY == 1) {
									objects.ball.DirX = getRandomInt(-1,1) * objects.ball.DirX;
									objects.ball.DirY = -objects.ball.DirY;
						}
					}
				}
		}
	};

	/* Initialize GL objects */
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

		objects.paddle1 = new Paddle(1, Settings.paddle.width, Settings.paddle.height, 0.0,
				-Settings.field.height / 2.0 + Settings.paddle.height, Settings.paddle.speed,
				buffers.paddle.vertex, buffers.paddle.vindex, buffers.paddle.vtexture, 
				Settings.paddle.texture1, buffers.paddle.vnormal);

		objects.paddle2 = new Paddle(2, Settings.paddle.width, Settings.paddle.height, 0.0,
				Settings.field.height / 2.0 - Settings.paddle.height, Settings.paddle.speed,
				buffers.paddle.vertex, buffers.paddle.vindex, buffers.paddle.vtexture,
				Settings.paddle.texture2, buffers.paddle.vnormal);

		return objects;
	};

	return module;

}());