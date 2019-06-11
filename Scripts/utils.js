console.log('utils.js');

var formats = {
    maven: "maven",
    npm: "npm",
    nuget: "nuget",
    gem: "gem",
    pypi: "pypi",
    composer: "composer", //packagist website but composer format
    cocoapods: "cocoapods",
    cran: "cran",
    cargo: "cargo", //cargo == crates == rust
    golang: "golang",
    github: "github"
}

//This is the format in nexus repo for proxy repos
var nexusRepoformats = {
    maven: "maven2",
    npm: "npm",
    nuget: "nuget",
    gem: "rubygems",
    pypi: "pypi"
}

//This is the format in artifactory repo for proxy repos
var artifactoryRepoformats = {
    maven: "maven2",
    npm: "npm",
    nuget: "nuget",
    gem: "rubygems",
    pypi: "pypi"
}
const dataSources = {
    NEXUSIQ: 'NEXUSIQ',
    OSSINDEX: 'OSSINDEX'
}

var messageTypes = {
    login: "login",  //message to send that we are in the process of logging in
    evaluate: "evaluate",  //message to send that we are evaluating
    loggedIn:"loggedIn",    //message to send that we are in the loggedin
    displayMessage: "displayMessage",  //message to send that we have data from REST and wish to display it
    loginFailedMessage: "loginFailedMessage",  //message to send that login failed
    beginevaluate: "beginevaluate",  //message to send that we are beginning the evaluation process, it's different to the evaluatew message for a readon that TODO I fgogot
    artifact: "artifact" //passing a artifact/package identifier from content to the background to kick off the eval

};



function checkPageIsHandled(url){
    console.log("checkPageIsHandled")
    console.log(url)
    //check the url of the tab is in this collection
    // let url = tab.url
    let found = false
    if (url.search("https://search.maven.org/") >= 0 ||
        url.search("https://mvnrepository.com/") >= 0 ||
        url.search("https://www.npmjs.com/") >= 0 ||
        url.search("https://www.nuget.org/") >= 0 ||
        url.search("https://rubygems.org/") >= 0 ||
        url.search("https://pypi.org/") >= 0 ||
        url.search("https://packagist.org/") >= 0 ||
        url.search("https://cran.r-project.org/") >= 0 ||
        url.search("https://crates.io/") >= 0 ||
        url.search("https://search.gocenter.io/") >= 0 ||
        url.search("https://github.com/") >= 0 || //https://github.com/jquery/jquery/releases/tag/3.0.0
        url.search("/webapp/#/artifacts/") >= 0 || //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
        url.search("/list/") >= 0 ||//https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
        url.search("/#browse/browse:") >= 0 //http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
        ) 
        {
            found = true;
        }
    return found;
}


function ParsePageURL(url){
    //artifact varies depending on eco-system
    //returns an artifact if URL contains the version
    //if not a version specific URL then returns a falsy value
    console.log('ParsePageURL');
    //who I am what is my address?
    let artifact;
    let format;
    console.log(url);

    if (url.search('search.maven.org/artifact/') >=0){
        //https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar  
        format = formats.maven;
        artifact = parseMavenURL(url);

    }
    else if (url.search('https://mvnrepository.com/artifact/') >=0){
        //https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
        format = formats.maven;
        artifact = parseMavenURL(url);
    }

    else if (url.search('www.npmjs.com/package/') >= 0){
      //'https://www.npmjs.com/package/lodash'};
      format = formats.npm;
      artifact = parseNPMURL(url);
    }
    else if (url.search('https://www.nuget.org/packages/') >=0){
      //https://www.nuget.org/packages/LibGit2Sharp/0.1.0
      format = formats.nuget;
      artifact =  parseNugetURL( url);
    }    
    
    else if (url.search('pypi.org/project/') >=0){
      //https://pypi.org/project/Django/1.6/
      format = formats.pypi;
      artifact = parsePyPIURL(url);

    }
    
    else if (url.search('rubygems.org/gems/') >=0){
      //https://rubygems.org/gems/bundler/versions/1.16.1
      format = formats.gem;
      artifact = parseRubyURL(url);

    }
    
    //OSSIndex
    else if (url.search('packagist.org/packages/') >=0){
      //https: packagist ???
      format = formats.composer;      
      artifact = parsePackagistURL(url);

    }
    else if (url.search('cocoapods.org/pods/') >=0){
      //https:// cocoapods ???
      format = formats.cocoapods;      
      artifact = parseCocoaPodsURL(url);

    }
    else if (url.search('cran.r-project.org/') >=0){      
      format = formats.cran;      
      artifact = parseCRANURL(url);
    }
    
    else if (url.search('https://crates.io/crates/') >=0){      
      format = formats.cargo;
      artifact = parseCratesURL(url);
    }
    else if (url.search('https://search.gocenter.io/') >=0){      
      format = formats.golang;
      artifact = parseGoLangURL(url);
    }
    //https://github.com/jquery/jquery/releases/tag/3.0.0
    else if (url.search('https://github.com/') >=0){      
      format = formats.github;
      artifact = parseGitHubURL(url);
    }
    //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
    //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
    else if (url.search('webapp/#/artifacts') >=0 || url.search('/list/') >=0 ){      
      artifact = parseArtifactoryURL(url);
    }

    //nexus Repo
    // http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
    else if (url.search('#browse/browse:') >=0 ){              
        // artifact = parseNexusRepoURL(url);
        artifact = undefined;
    }
      

    console.log("ParsePageURL Complete");
    console.log(artifact);
    //now we write this to background as
    //we pass variables through background
    return artifact;
};



function BuildEmptySettings(){
    let settings = {
        username : "",
        password : "",
        tok : "",
        hash : "",
        auth : "",
        restEndPoint : "",
        baseURL : "",
        url : "",
        loginEndPoint: "",
        loginurl: ""
    }
    return settings;
}

function removeCookies(settings_url){
    console.log('removeCookies')
    console.log(settings_url)
    //settings.url = http://iq-server:8070/
    let leftPart = settings_url.search('//')+2;
    let server = settings_url.substring(leftPart);
    let rightPart = server.search(':')-1;
    if (rightPart < 0){
        rightPart = server.search(leftPart, '/')-1;
        if (rightPart < 0){
            rightPart = server.length;
        }
    }
    server = server.substring(0, rightPart+1)
    //".iq-server"
    let domain = "." + server;
    chrome.cookies.getAll({domain: domain}, function(cookies) {
        console.log('here');
        for(var i=0; i<cookies.length;i++) {
          console.log(cookies[i]);
    
          chrome.cookies.remove({url: settings_url, name: cookies[i].name});
        }
      });
    //the only one to remove is this one.
    chrome.cookies.remove({url: settings_url, name: "CLMSESSIONID"});  
}

function NexusFormat(artifact){
    let format = artifact.format;
    switch (format){
        case formats.npm:
            requestdata = NexusFormatNPM(artifact);
            break;
        case formats.maven:
            requestdata = NexusFormatMaven(artifact);
            break;
        case formats.gem:
            requestdata = NexusFormatRuby(artifact);
            break;
        case formats.pypi:
            requestdata = NexusFormatPyPI(artifact);
            break;
        case formats.nuget:
            requestdata = NexusFormatNuget(artifact);
            break;
        
        default:
            return;
            break;
    }
    return requestdata;
}

function NexusFormatMaven(artifact){  
	//return a dictionary in Nexus Format
    //return dictionary of components
    componentDict = {components:[	
		component = {
			hash: artifact.hash, 
			componentIdentifier: 
				{
				format: artifact.format,
				coordinates : 
					{
						groupId: artifact.groupId, 
						artifactId: artifact.artifactId, 
                        version : artifact.version,
                        extension: artifact.extension,
                        classifier: ""
					}
				}
            }
        ]
    }
    return componentDict
};
function NexusFormatNPM(artifact){  
	//return a dictionary in Nexus Format
    //return dictionary of components
    componentDict = {"components":[	
        component = {
            "hash": artifact.hash, 
            "componentIdentifier": 
                {
                "format": artifact.format,
                "coordinates" : 
                    {
                        "packageId": artifact.packageName, 
                        "version" : artifact.version
                    }
                }
          }
        ]
    }
	return componentDict
};
function NexusFormatNuget(artifact){
	//return a dictionary in Nexus Format ofr Nuget
    //return dictionary of components
    componentDict = {
        "components":[
            component = {
                "hash": artifact.hash, 
                "componentIdentifier": {
                    "format": artifact.format,
                    "coordinates" : {
                        "packageId": artifact.packageId, 
                        "version" : artifact.version
                        }
                    }
                }
            ]
        }
	return componentDict
};
function NexusFormatPyPI(artifact){
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    componentDict = {"components":[	

            component = {
                "hash": artifact.hash, 
                "componentIdentifier": 
                    {
                    "format": artifact.format,
                    "coordinates" : 
                        {
                            "name": artifact.name, 
                            "qualifier": 'py2.py3-none-any',
                            "version" : artifact.version,
                            "extension" : 'whl'
                        }
                    }
            }
        ]
    }
	return componentDict
};
function NexusFormatRuby(artifact){
	//return a dictionary in Nexus Format
    //return dictionary of components
    //TODO: how to determine the qualifier and the extension??
    componentDict = {"components":[	
		component = {
			"hash": artifact.hash, 
			"componentIdentifier": 
				{
				"format": artifact.format,
				"coordinates" : 
					{
                    "name": artifact.name, 
                    "version" : artifact.version
					}
				}
      }
    ]
  }
	return componentDict
};

function epochToJsDate(ts){
    // ts = epoch timestamp
    // returns date obj
    return new Date(ts*1000);
  }
  
function jsDateToEpoch(d){
    // d = javascript date obj
    // returns epoch timestamp
    console.log(d)
    if(!(d instanceof Date)){
        throw new TypeError('Bad date passed in');
    }
    else{
        return (d.getTime()-d.getMilliseconds())/1000;
    }
}

function encodeComponentIdentifier(nexusArtifact){
    let actual =  encodeURIComponent(JSON.stringify(nexusArtifact.components[0].componentIdentifier))
    console.log(actual);
    return actual;
}


function parseMavenURL(url) {
    console.log('parseMavenURL')      
      //maven repo https://mvnrepository.com/artifact/commons-collections/commons-collections/3.2.1
      //SEARCH      https://search.maven.org/artifact/commons-collections/commons-collections/3.2.1/jar
      //CURRENTLY both have the same format in the URL version, except maven central also has the packaging type  
      let format = formats.maven;
      let datasource = dataSources.NEXUSIQ;

      let elements = url.split('/')
      let groupId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      groupId = encodeURIComponent(groupId);
      let artifactId = elements[5];
      artifactId = encodeURIComponent(artifactId);
    
      let version = elements[6];
      version = encodeURIComponent(version);
      
      let extension = elements[7];
      if (typeof extension === "undefined"){
        //mvnrepository doesnt have it
        extension = "jar"
      }
      extension = encodeURIComponent(extension);
      let classifier = "";
      let artifact = {
          format: format, 
          groupId:groupId, 
          artifactId:artifactId, 
          version:version, 
          extension: extension,
          classifier: classifier,
          datasource: datasource
        }
      return artifact;
};

function parseNPMURL(url) {
    //ADD SIMPLE CODE THAT Check THE URL
    //this is run outside of the content page
    //so can not see the dom
    //need to handle when the component has a slash in the name
    //https://www.npmjs.com/package/@angular/animation/v/4.0.0-beta.8
    let format = formats.npm;
    let datasource = dataSources.NEXUSIQ;

    let packageName
    let version
    let artifact = ""
    if (url.search('/v/') >0 ){
      //has version in URL
      var urlElements = url.split('/');
      if (urlElements.length>=8){
        packageName = urlElements[4] +'/'+ urlElements[5];
        version = urlElements[7]
        // packageName = encodeURIComponent(packageName);
        // version = encodeURIComponent(version);    
      }
      else{
        packageName = urlElements[4]
        version = urlElements[6]
        // packageName = encodeURIComponent(packageName);
        // version = encodeURIComponent(version);    
      }
      artifact = {
          format: format, 
          packageName: packageName, 
          version: version,
          datasource: datasource
        };
    }else{
        artifact = ""
    }
    return artifact;
};

function parseNugetURL(url) {
    //https://www.nuget.org/packages/LibGit2Sharp/0.20.1
    let format = formats.nuget;
    let datasource = dataSources.NEXUSIQ;

    var elements = url.split('/')
    var artifact    = ""
    if (elements.length==6){
      packageId = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);
      version = elements[5];
      packageId = encodeURIComponent(packageId);
      version = encodeURIComponent(version);
      artifact =  {
          format: format, 
          packageId: packageId, 
          version: version,
          datasource: datasource
        }
      }
    else{
        artifact = ""
    }
    return artifact;
};

function parsePyPIURL(url) {
    console.log('parsePyPI');
    //https://pypi.org/project/Django/1.6/
    //return falsy if no version in the URL
    let format = formats.pypi;
    let datasource = dataSources.NEXUSIQ;

    let elements = url.split('/')
    let artifact = ""
    if (elements[5]==""){
        artifact = ""
    }
    else{
      name = elements[4];
      //  packageName=url.substr(url.lastIndexOf('/')+1);    
      version = elements[5];
      name = encodeURIComponent(name);
      version = encodeURIComponent(version);
      artifact = {
          format: format, 
          name: name, 
          version: version,
          datasource: datasource
        };
    }
    return artifact;
};

function parseRubyURL(url) {
    console.log('parseRubyURL');
    let format = formats.gem;
    let datasource = dataSources.NEXUSIQ;

    let elements = url.split('/')
    let artifact
    if (elements.length < 6){
        //current version is inside the dom
        //https://rubygems.org/gems/bundler
        //return falsy
        artifact = ""
    }
    else{
        //https://rubygems.org/gems/bundler/versions/1.16.1
        name = elements[4];
        version = elements[6];
        name = encodeURIComponent(name);
        version = encodeURIComponent(version);
        artifact = {
            format: format, 
            name: name, 
            version: version,
            datasource: datasource
        };
    }
    return artifact;
};

function parsePackagistURL(url) {
    //server is packagist, format is composer
    console.log('parsePackagist:' +  url);
    const elements = url.split('/')
    let format = formats.composer;
    let datasource = dataSources.OSSINDEX;

    let artifact
    let name
    let version
    //https://packagist.org/packages/drupal/drupal
    //Specific version is with a hash
    //https://packagist.org/packages/drupal/drupal#8.6.2
    //https://packagist.org/packages/phpbb/phpbb#3.1.2
    let namePt1 = elements[4];
    let namePt2 = elements[5];

    let whereIs = namePt2.search("#")
    //is the version number in the URL? if so get that, else get it from the HTML
    //can only parse the DOM from content script
    //so this script will return falsy
    if (whereIs > -1 ){
        version = namePt2.substr(whereIs +1)
        namePt2 = namePt2.substr(0, whereIs)
        name = namePt1 + "/" + namePt2
        name = encodeURIComponent(name);
        version = encodeURIComponent(version);
        artifact = {
            format: format, 
            datasource: datasource,
            name: name, 
            version: version
        }  
    } else{
      //return falsy
      artifact = ""
    }
    return artifact;
}

function parseCocoaPodsURL(url) {
    console.log('parseCocoaPodsURL');
    let format = formats.cocoapods;
    let datasource = dataSources.OSSINDEX;

    // var elements = url.split('/')
    //https://cocoapods.org/pods/TestFairy
    //no version number in the URL
    return false;
  }

function parseCRANURL(url) {
    //https://cran.r-project.org/
    // https://cran.r-project.org/web/packages/latte/index.html
    //https://cran.r-project.org/package=clustcurv
    //no version ATM
    let format = formats.cocoapods;
    let datasource = dataSources.OSSINDEX;

    return false;
}

function parseGoLangURL(url) {
    //https://gocenter.jfrog.com/github.com~2Fhansrodtang~2Frandomcolor/versions
    //https://search.gocenter.io/github.com~2Fbazelbuild~2Fbazel-integration-testing/versions
    let format = formats.golang;
    let datasource = dataSources.OSSINDEX;

    return false;
}

function parseGitHubURL(url) {
    console.log('parseGitHubURL', url)
    //https://github.com/jquery/jquery/releases/tag/3.0.0
    let format = formats.github;
    let datasource = dataSources.OSSINDEX;

    let packageName
    let version
    let artifact = ""
    if (url.search('/releases/tag/') >0 ){
      //has version in URL
      var urlElements = url.split('/');
      if (urlElements.length>=8){
        packageName = urlElements[3] +'/'+ urlElements[4];
        version = urlElements[7]
      }
      else{
        packageName = urlElements[4]
        version = urlElements[6]
      }
      artifact = {
          format: format, 
          name: packageName, 
          version: version,
          datasource: datasource
        };
    }else{
        artifact = ""
        return false;
    }
    console.log('artifact', artifact)
    return artifact;
    
}

function parseNexusRepoURL(url){
    console.log('parseNexusRepoURL', url)
    //http://nexus:8081/#browse/browse:maven-central:antlr%2Fantlr%2F2.7.2
    //http://nexus:8081/#browse/browse:npm-proxy:%40akryum%2Fwinattr%2Fwinattr-3.0.0.tgz
    //http://nexus:8081/#browse/search=keyword%3Dlodash:2a59043ed2ea556e86a68efbf920b14d:40292acdebc01b836aa6c0988697aca5
    //http://nexus:8081/#browse/browse:npm-proxy:lodash%2Flodash-4.17.9.tgz
    //pypi
    // http://nexus:8081/#browse/browse:pypi-proxy:abodepy%2F0.15.0%2Fabodepy-0.15.0-py3-none-any.whl
    let artifact;
    let elements = url.split('/');
    let browseElement = elements[elements.length-1]; //last item
    let browseElements=  browseElement.split(':');
    let groupEls  = browseElements[2].split('%2F');
    let format = formats.maven;
    //"abodepy%2F0.15.0%2Fabodepy-0.15.0-py3-none-any.whl"
    if (groupEls.length==3 && groupEls[2].endsWith('.whl')){
        //I will deem this as pypi
        format = formats.pypi;
    }    
    else if (groupEls[1].search('-') > -1){
        //I will deem this as npm
        format = formats.npm;
    }
    if (format === formats.pypi){
        let fileName = groupEls[2]
        let name = groupEls[0]
        name = encodeURIComponent(name);
        let version = groupEls[1] 
        version = encodeURIComponent(version);
        let datasource = dataSources.NEXUSIQ;
        artifact = {
            format: format, 
            name: name, 
            version: version,
            datasource: datasource
          };
    }
    if (format === formats.npm){
        let fileName = groupEls[1]
        let packageName
        let version
        packageName = fileName.substring(0, fileName.search('-'));
        version = fileName.substring(fileName.search('-')+1, fileName.lastIndexOf('.'))
        datasource = dataSources.NEXUSIQ;
        artifact = {
            format: format, 
            packageName: packageName, 
            version: version,
            datasource: datasource
        };
    }

    if (format === formats.maven){
        let groupId 
        let artifactId 
        let version
        let extension

        let classifier = "";
        let datasource = dataSources.NEXUSIQ;

        groupId = groupEls[0]
        artifactId = groupEls[1]
        version = groupEls[2]
        extension = "jar"

        groupId = encodeURIComponent(groupId);
        artifactId = encodeURIComponent(artifactId);
        version = encodeURIComponent(version);
        extension = encodeURIComponent(extension);
        artifact = {
            format: format, 
            groupId:groupId, 
            artifactId:artifactId, 
            version:version, 
            extension: extension,
            classifier: classifier,
            datasource: datasource
          }
    }
    return artifact;
}


function parseArtifactoryURL(url) {
    console.log('parseArtifactoryURL', url)
    //java object
    //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
    //npm object
    // https://repo.spring.io/webapp/#/artifacts/browse/tree/General/npmjs-cache/parseurl/-/parseurl-1.0.1.tgz
    //java
    //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE
    //compare this to
    //https://search.maven.org/artifact/org.springframework/spring-core/4.1.7.RELEASE/jar
    //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/cloudfoundry/cf-maven-plugin/1.1.4.RELEASE/cf-maven-plugin-1.1.4.RELEASE.jar
    //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/

    let elements = url.split('/')
    let format = formats.maven;
    let datasource = dataSources.NEXUSIQ;
    let artifact
    var found = elements.find(function(element) {
        return element === '-';
    });
    if (found){
        //npm
        format = formats.npm;
        datasource = dataSources.NEXUSIQ;
    }else{
        //maven
        format = formats.maven;
        datasource = dataSources.NEXUSIQ;
    }
    //now lets iterate through the elements of the URL
    //when we find the # we are at the root of the path
    let baseIndex = 0 ;
    let groupIdIndex = 0;
    let artifactIdIndex  = 0;
    let versionIndex = 0
    let extensionIndex = 0;
    let packageNameIndex = 0;
    let repoIndex = 0;

    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element==="#") {
            //we are at the base offset
            //now this can be tricky
            //repository will be the 5th element after #

            baseIndex = index;
            repoIndex = baseIndex+5;
            break;
        }
        if (element === 'list'){
            //https://repo.spring.io/list/jcenter-cache/org/cloudfoundry/cf-maven-plugin/1.1.3/
            //we are at the base offset
            baseIndex = index;
            repoIndex = baseIndex+1;
            break;
        }
    }
    console.log('format', format, baseIndex, repoIndex, elements.length);
    if (format === formats.npm) {
        packageNameIndex = repoIndex + 1;
        versionIndex = packageNameIndex + 2;            

        let packageName
        let version
        
        packageName = elements[packageNameIndex];
        let fileName = elements[versionIndex];
        version = fileName.substring(fileName.search('-')+1, fileName.lastIndexOf('.'))
        artifact = {
            format: format, 
            packageName: packageName, 
            version: version,
            datasource: datasource
        };
    } else if (format === formats.maven){
        let lastElementIsFileName = false
        if (elements[elements.length-1].search(/[.][a-z]ar/) > -1){
            //last element is the filename
            //"cf-maven-plugin-1.1.4.RELEASE.jar"
            lastElementIsFileName = true;
        }
        //work out how many elements there are in the group/artifact/version section
        let numElements = elements.length - repoIndex -1;
        //if there are 5 and the last element is a filename
        //then first 2 elements are the group
        //3rd is the artifact
        //4th is the name
        let groupId;
        let artifactId;
        let version;
        let extension;
        //group can be in two parts
        groupIdIndex = repoIndex + 1;
        artifactIdIndex = groupIdIndex + 1;
        versionIndex = artifactIdIndex + 1;
        extensionIndex = versionIndex + 1;

        console.log('here', numElements, lastElementIsFileName);
        if (numElements ===5 && lastElementIsFileName){
            

            //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/cloudfoundry/cf-maven-plugin/1.1.4.RELEASE/cf-maven-plugin-1.1.4.RELEASE.jar"
            groupIdIndex = repoIndex + 1;
            artifactIdIndex = groupIdIndex + 2;
            versionIndex = artifactIdIndex + 1;
            extensionIndex = versionIndex + 1;
    
            groupId = elements[groupIdIndex] + '.' + elements[groupIdIndex+1];
            artifactId = elements[artifactIdIndex];
            version = elements[versionIndex];
            extension = elements[extensionIndex];
            extension = extension.substring(extension.lastIndexOf(".") + 1, extension.length);

        }
        else if (numElements ===5 && !lastElementIsFileName){
            //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE
            groupIdIndex = repoIndex + 1;
            artifactIdIndex = groupIdIndex + 2;
            versionIndex = artifactIdIndex + 1;
            extensionIndex = versionIndex + 1;
    
            groupId = elements[groupIdIndex] + '.' + elements[groupIdIndex+1];
            artifactId = elements[artifactIdIndex];
            version = elements[versionIndex];
            extension = 'jar';
        }
        else if (numElements ==4 && lastElementIsFileName){
            //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/us-remote/antlr/antlr/2.7.1/antlr-2.7.1.jar
            groupId = elements[groupIdIndex];
            artifactId = elements[artifactIdIndex];          
            version = elements[versionIndex];            
            extension = elements[extensionIndex];
            extension = extension.substring(extension.lastIndexOf(".") + 1, extension.length);
        }
        else if (numElements ==4 && !lastElementIsFileName){
            //http://10.77.1.26:8081/artifactory/webapp/#/artifacts/browse/tree/General/spring-release-cache/org/springframework/spring-core/4.1.7.RELEASE
            groupId = elements[groupIdIndex]+ '.' + elements[groupIdIndex+1];
            artifactIdIndex = groupIdIndex + 2;
            artifactId = elements[artifactIdIndex];
            versionIndex = artifactIdIndex + 1;
            version = elements[versionIndex];            
            extension = 'jar';
        }

        groupId = encodeURIComponent(groupId);
        artifactId = encodeURIComponent(artifactId);
        version = encodeURIComponent(version);
        extension = encodeURIComponent(extension);
        let classifier = "";
        artifact = {
            format: format, 
            groupId:groupId, 
            artifactId:artifactId, 
            version:version, 
            extension: extension,
            classifier: classifier,
            datasource: datasource
          }
    }
    console.log('artifact', artifact);
    return artifact;
    
}



function BuildSettings(baseURL, username, password, appId, appInternalId){
    //let settings = {};
    console.log("BuildSettings");
    let tok = username + ':' + password;
    let hash = btoa(tok);
    let auth =  "Basic " + hash;
    let restEndPoint = "api/v2/components/details"
    if (baseURL.substring(baseURL.length-1) !== '/'){
        baseURL =baseURL + '/'
    }
    let url = baseURL + restEndPoint
    //login end point
    let loginEndPoint = "rest/user/session"
    let loginurl = baseURL + loginEndPoint
  
    //whenDone(settings);
    let settings = {
        username : username,
        password : password,
        tok : tok,
        hash : hash,
        auth : auth,
        restEndPoint : restEndPoint,
        baseURL : baseURL,
        url : url,
        loginEndPoint: loginEndPoint,
        loginurl: loginurl,
        appId: appId,
        appInternalId: appInternalId
    }
    return settings;        
}; 

function parseCratesURL( url) {
    //server is crates, language is rust
    //https://crates.io/crates/rand
    //no version in the URL    
    let format = formats.cargo;
    let datasource = dataSources.OSSINDEX;

    return false;
  }


if (typeof module !== "undefined"){
    module.exports = {
        BuildEmptySettings: BuildEmptySettings, 
        checkPageIsHandled: checkPageIsHandled,
        removeCookies: removeCookies,
        NexusFormatMaven: NexusFormatMaven,
        NexusFormatNPM: NexusFormatNPM,
        NexusFormatNuget: NexusFormatNuget,
        NexusFormatPyPI: NexusFormatPyPI,
        NexusFormatRuby: NexusFormatRuby,
        epochToJsDate: epochToJsDate,
        jsDateToEpoch: jsDateToEpoch,
        encodeComponentIdentifier: encodeComponentIdentifier,
        parseMavenURL: parseMavenURL,
        parseNPMURL: parseNPMURL,
        parseNugetURL: parseNugetURL,
        parsePyPIURL: parsePyPIURL,
        parseRubyURL: parseRubyURL,
        parsePackagistURL: parsePackagistURL,
        parseCocoaPodsURL: parseCocoaPodsURL,
        parseCRANURL: parseCRANURL,
        parseGoLangURL: parseGoLangURL,
        parseCratesURL: parseCratesURL,
        ParsePageURL: ParsePageURL
        
    };
}