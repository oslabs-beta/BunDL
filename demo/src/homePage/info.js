import React from 'react';
import './info.css';
import { useNavigate } from 'react-router';

const Info = () => {
	const navigate = useNavigate();
	const handleDemoButtonClick = () => {
		navigate('/demo');
	};

	return (
		<div className='info-container'>
			<div className='main-and-img-info'>
				<div className='main'>
					<div className='title-info'>
						<h1 className='title'>bunDL</h1>
						<p className='info'> A lightweight caching tool designed to intercept GraphQL queries, providing real-time monitoring all powered by Bun </p>
						<button className='demo-button' type='button' onClick={handleDemoButtonClick}>
							Demo
						</button>
					</div>
					<div className='install-container'>
						<div className='install'>
							<h3 id='install'>Install bunDL v 1.0 (Client)</h3>
							<h4 id='npm-box'>bun install bundl-cache</h4>
							<h3 id='install'>Install bunDL v 1.0 (Server)</h3>
							<h4 id='npm-box'>bun install bundl-server</h4>
						</div>
					</div>
				</div>

				<div className='bt-main-gif'></div>
				<div className='gif-box'>{/* <h1>gif here</h1> */}</div>
			</div>

			{/* <div className = 'npm-box'>
          <h3>NPM LINK</h3>
        </div> */}

			<div className='sub-info'>
				{/* <div id='box-1'> */}
        <div className='blurbBox'>
					<p className='box-title'>Server and Client Side Caching</p>
					<div className='box-info'>
						<p>
							<strong>In-Memory Storage:</strong> fast access to frequently used data
						</p>
						<p>
							<strong>Disk-Based Storage:</strong> Suitable for larger datasets
						</p>
						<p>
							<strong>Time-to-Live:</strong> Automatic eviction of old data based on time or size constraints
						</p>
					</div>
					{/* <p id = 'box-p'>INSERT BUNDL INFO HERE.</p> */}
				</div>

				{/* <div id='box-2'> */}
        <div className='blurbBox'>
					<p className='box-title'>Database Integration</p>
					<div className='box-info'>
						<p>
							<strong>SQL Support:</strong> connect to MySQL, PostgreSQL, and SQLite Databases
						</p>
						<p>
							<strong>NoSQL Support:</strong> options for integrating with MongoDB, Redis, and others
						</p>
						<p>
							<strong>Syncing:</strong> designed to work with PouchDB and CouchDB for data stability and offline access
						</p>
					</div>
				</div>

				{/* <div id='box-3'> */}
        <div className='blurbBox'>
					<p className='box-title'>Query Optimization</p>
					<div className='box-info'>
						<p>
							<strong>Lazy Loading:</strong> fetching only the data needed, reducing load times
						</p>
						<p>
							<strong>Batch Processing:</strong> Perform bulk operations for improved efficiency
						</p>
						<p>
							<strong>Indexing:</strong> Speed up data retrieval operations with intelligent indexing
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Info;
